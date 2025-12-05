// LLM API를 사용하여 차트 생성 로직

// 예시 데이터 (사용자가 제공한 커피 캡슐 데이터)
const exampleData = [
  { manufacturer: "스타벅스", item: "기본 커피 캡슐", normal: 899, sale: 899 },
  { manufacturer: "스타벅스", item: "돌체구스토 호환 캡슐", normal: 708, sale: 708 },
  { manufacturer: "네스프레소", item: "기본 커피 캡슐 (25~40ml)", normal: 769, sale: 699 },
  { manufacturer: "네스프레소", item: "기본 커피 캡슐 40ml", normal: 769, sale: 699 },
  { manufacturer: "네스프레소", item: "룽고 110ml (가향)", normal: 857, sale: 799 },
  { manufacturer: "네스프레소", item: "룽고 110ml (일반)", normal: 769, sale: 699 },
  { manufacturer: "카누", item: "네스프레소 호환", normal: 799, sale: 549 },
  { manufacturer: "카누", item: "돌체구스토 호환", normal: 1249, sale: 899 },
  { manufacturer: "카누", item: "카누머신 전용", normal: 940, sale: 840 },
  { manufacturer: "카누", item: "카누머신 전용/싱글오리진", normal: 1059, sale: 959 },
  { manufacturer: "커피빈", item: "네스프레소 호환", normal: 750, sale: 675 },
  { manufacturer: "폴바셋", item: "네스프레소 호환", normal: 820, sale: 820 },
  { manufacturer: "할리스", item: "네스프레소 호환", normal: 850, sale: 680 }
];

const brandColorMap: Record<string, string> = {
  "스타벅스": "#ef4444",
  "네스프레소": "#22c55e",
  "카누": "#f97316",
  "커피빈": "#a855f7",
  "폴바셋": "#0ea5e9",
  "할리스": "#9ca3af"
};

// 프롬프트에서 데이터 추출 함수
function parseDataFromPrompt(prompt: string): any[] | null {
  // 테이블 형식 데이터 파싱 (예: 제조사 | 제품 | 가격 형식)
  const lines = prompt.split('\n').filter(line => line.trim());
  
  // 숫자가 포함된 라인 찾기
  const dataLines = lines.filter(line => {
    const hasNumber = /\d+/.test(line);
    const hasText = /[가-힣a-zA-Z]/.test(line);
    return hasNumber && hasText;
  });

  if (dataLines.length === 0) {
    return null;
  }

  // 테이블 형식 파싱 시도
  const parsedData: any[] = [];
  
  for (const line of dataLines) {
    // 탭이나 파이프(|) 또는 쉼표로 구분된 데이터
    const parts = line.split(/[\t|,，]/).map(p => p.trim()).filter(p => p);
    
    if (parts.length >= 2) {
      // 숫자 추출
      const numbers = parts.map(p => {
        const numMatch = p.match(/[\d,]+/);
        return numMatch ? parseInt(numMatch[0].replace(/,/g, '')) : null;
      }).filter(n => n !== null);
      
      // 텍스트 추출
      const texts = parts.map(p => {
        const textMatch = p.match(/[가-힣a-zA-Z\s]+/);
        return textMatch ? textMatch[0].trim() : null;
      }).filter(t => t !== null && t.length > 0);
      
      if (numbers.length > 0 && texts.length > 0) {
        parsedData.push({
          labels: texts,
          values: numbers
        });
      }
    } else {
      // 단일 라인에서 숫자와 텍스트 추출
      const numbers = line.match(/[\d,]+/g)?.map(n => parseInt(n.replace(/,/g, ''))) || [];
      const texts = line.match(/[가-힣a-zA-Z]+/g) || [];
      
      if (numbers.length > 0 && texts.length > 0) {
        parsedData.push({
          labels: texts,
          values: numbers
        });
      }
    }
  }

  return parsedData.length > 0 ? parsedData : null;
}

export async function generateChart(
  prompt: string, 
  imageFile?: File | null,
  previousChartConfig?: any | null
): Promise<any> {
  // 이전 차트가 있고 개선 요청인 경우 - LLM API를 통해 개선
  // improveChart는 단순 복사이므로 LLM API를 먼저 시도
  // if (previousChartConfig && isImprovementRequest(prompt)) {
  //   return improveChart(previousChartConfig, prompt);
  // }

  // LLM API 호출 시도
  try {
    // 이미지를 base64로 변환
    let imageBase64: string | undefined;
    if (imageFile) {
      imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // data:image/...;base64, 부분 제거
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
    }

    // API 라우트 호출
    const response = await fetch('/api/generate-chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image: imageBase64,
        previousChartConfig: previousChartConfig || null
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.chartConfig) {
        // 디버깅 정보 출력
        if (data.debug) {
          console.log('🔍 차트 생성 정보:', {
            이미지사용: data.debug.hasImage ? '✅ 예' : '❌ 아니오',
            이미지모드: data.debug.hasImage ? (data.debug.extractImageData ? '📊 데이터 추출' : '🎨 스타일 참고') : '-',
            모델: data.debug.model,
            토큰사용량: data.debug.tokensUsed
          });
          
          // 비용 정보 출력
          if (data.debug.cost) {
            console.log('💰 예상 비용:', {
              입력비용: `$${data.debug.cost.input.toFixed(6)}`,
              출력비용: `$${data.debug.cost.output.toFixed(6)}`,
              총비용: `$${data.debug.cost.total.toFixed(6)}`,
              원화환산: `약 ₩${(data.debug.cost.total * 1300).toFixed(2)}` // 1 USD = 1300 KRW 가정
            });
          }
          
          if (data.debug.hasImage) {
            if (data.debug.extractImageData) {
              console.log('✅ AI가 이미지에서 데이터를 추출하여 차트를 생성했습니다.');
            } else {
              console.log('✅ AI가 이미지 스타일을 참고하고 텍스트 데이터를 사용하여 차트를 생성했습니다.');
            }
          } else {
            console.log('📝 텍스트 프롬프트만 사용하여 차트를 생성했습니다.');
          }
        }
        return data.chartConfig;
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || 'Unknown error';
      
      // 예산/쿼터 오류인 경우 사용자에게 안내하고 폴백 로직 사용
      if (errorMessage.includes('quota') || errorMessage.includes('billing') || errorMessage.includes('budget')) {
        console.warn('⚠️ OpenAI API 예산/쿼터 초과, 폴백 로직 사용');
        console.info('💡 OpenAI 예산 설정 방법:');
        console.info('   1. https://platform.openai.com/account/billing 접속');
        console.info('   2. "Usage limits" 또는 "Spending limits" 메뉴에서 예산 설정');
        console.info('   3. Hard limit을 $5 이상으로 설정 (또는 원하는 금액)');
        console.info('   4. 현재 폴백 로직으로 차트 생성 중...');
      } else {
        console.warn('⚠️ LLM API 호출 실패, 폴백 로직 사용:', errorMessage);
      }
      // 에러를 throw하지 않고 폴백 로직으로 진행
    }
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    
    // 예산/쿼터 오류인 경우 사용자에게 안내하고 폴백 로직 사용
    if (errorMessage.includes('quota') || errorMessage.includes('billing') || errorMessage.includes('budget')) {
      console.warn('⚠️ OpenAI API 예산/쿼터 초과, 폴백 로직 사용');
      console.info('💡 OpenAI 예산 설정 방법:');
      console.info('   1. https://platform.openai.com/account/billing 접속');
      console.info('   2. "Usage limits" 또는 "Spending limits" 메뉴에서 예산 설정');
      console.info('   3. Hard limit을 $5 이상으로 설정 (또는 원하는 금액)');
      console.info('   4. 현재 폴백 로직으로 차트 생성 중...');
    } else {
      console.warn('⚠️ LLM API 호출 중 오류 발생, 폴백 로직 사용:', errorMessage);
    }
    // 에러를 throw하지 않고 폴백 로직으로 진행
  }

  // 폴백: 프롬프트에서 데이터 파싱하여 차트 생성 (LLM API가 없거나 실패한 경우)
  // 이미지가 있으면 이미지 분석 (실제로는 Vision API 사용)
  if (imageFile) {
    console.log('이미지 분석 (폴백):', imageFile.name);
  }

  // 프롬프트에서 데이터 추출 시도
  const parsedData = parseDataFromPrompt(prompt);
  
  // 프롬프트에서 차트 타입 감지
  const lowerPrompt = prompt.toLowerCase();
  
  // slope chart 요청 (일반가/행사가 데이터가 있는 경우)
  if (lowerPrompt.includes('slope') || lowerPrompt.includes('일반가') || lowerPrompt.includes('행사가') || 
      (parsedData && parsedData.some(d => d.labels.some((l: string) => l.includes('일반') || l.includes('행사'))))) {
    return generateSlopeChart(parsedData);
  }
  
  // 버블 차트 요청
  if (lowerPrompt.includes('버블') || lowerPrompt.includes('bubble')) {
    return generateBubbleChart(parsedData);
  }
  
  // 바 차트 요청
  if (lowerPrompt.includes('바') || lowerPrompt.includes('막대') || lowerPrompt.includes('bar')) {
    return generateBarChart(parsedData);
  }
  
  // 파이 차트 요청
  if (lowerPrompt.includes('파이') || lowerPrompt.includes('pie') || lowerPrompt.includes('원형')) {
    return generatePieChart(parsedData);
  }
  
  // 라인 차트 요청
  if (lowerPrompt.includes('라인') || lowerPrompt.includes('line') || lowerPrompt.includes('선')) {
    return generateLineChart(parsedData);
  }

  // 파싱된 데이터가 있으면 바 차트로 생성 (기본)
  if (parsedData && parsedData.length > 0) {
    return generateBarChart(parsedData);
  }

  // 데이터 파싱 실패 시 에러 throw
  throw new Error('프롬프트에서 데이터를 추출할 수 없습니다. 데이터 형식을 확인해주세요.\n\n예시:\n스타벅스: 100\n네스프레소: 200\n카누: 150');
}

// 개선 요청인지 확인
function isImprovementRequest(prompt: string): boolean {
  const improvementKeywords = [
    '추가', '개선', '수정', '변경', '버튼', '기능', 
    '업데이트', '보완', '개발', '구현'
  ];
  return improvementKeywords.some(keyword => prompt.includes(keyword));
}

// 기존 차트를 기반으로 개선된 차트 생성
function improveChart(previousConfig: any, prompt: string): any {
  // 이전 차트 설정을 깊은 복사
  const improvedConfig = JSON.parse(JSON.stringify(previousConfig));
  
  // 버전 정보 추가
  improvedConfig.version = (previousConfig.version || 0) + 1;
  
  // 프롬프트에 따라 개선 사항 적용
  if (prompt.includes('버튼') || prompt.includes('선택')) {
    // 버튼 추가 요청인 경우 (예: 전체 선택/선택 취소)
    // 실제로는 LLM이 이전 차트를 분석하고 요구사항을 반영해야 함
    // 여기서는 예시로 tooltip에 버튼 정보 추가
    if (!improvedConfig.tooltip) {
      improvedConfig.tooltip = {};
    }
    improvedConfig.tooltip.extraCssText = 'pointer-events: auto;';
    
    // 차트에 버튼 추가를 위한 custom component (실제 구현 필요)
    improvedConfig.graphic = improvedConfig.graphic || [];
    improvedConfig.graphic.push({
      type: 'group',
      left: 'right',
      top: 20,
      children: [
        {
          type: 'rect',
          shape: { width: 100, height: 30 },
          style: {
            fill: '#4f46e5',
            text: '전체 선택',
            cursor: 'pointer'
          }
        }
      ]
    });
  }
  
  // 다른 개선 사항들도 여기에 추가 가능
  // 실제로는 LLM이 프롬프트를 분석하여 적절한 개선을 수행해야 함
  
  return improvedConfig;
}

function generateBubbleChart(parsedData?: any[] | null) {
  // 더미 데이터 생성
  const bubbleData = [
    { name: '제품 A', value: [10, 20, 30], itemStyle: { color: '#5470c6' } },
    { name: '제품 B', value: [15, 25, 40], itemStyle: { color: '#91cc75' } },
    { name: '제품 C', value: [20, 30, 50], itemStyle: { color: '#fac858' } },
    { name: '제품 D', value: [25, 35, 60], itemStyle: { color: '#ee6666' } },
    { name: '제품 E', value: [30, 40, 70], itemStyle: { color: '#73c0de' } },
    { name: '제품 F', value: [35, 45, 80], itemStyle: { color: '#3ba272' } },
  ];

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      textStyle: { color: "#1a1a1a" },
      formatter: (params: any) => {
        const data = params.data.value;
        return `${params.data.name}<br/>X: ${data[0]}, Y: ${data[1]}, 크기: ${data[2]}`;
      }
    },
    legend: {
      data: bubbleData.map(d => d.name),
      top: 10,
      textStyle: { color: "#374151", fontSize: 12 }
    },
    grid: {
      left: 60,
      right: 60,
      top: 60,
      bottom: 60
    },
    xAxis: {
      type: "value",
      name: "X축",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: { color: "#6b7280" },
      axisLine: { lineStyle: { color: "#d1d5db" } },
      axisLabel: { color: "#6b7280", fontSize: 11 },
      splitLine: { lineStyle: { color: "#e5e7eb", type: "dashed" } }
    },
    yAxis: {
      type: "value",
      name: "Y축",
      nameLocation: "middle",
      nameGap: 50,
      nameTextStyle: { color: "#6b7280" },
      axisLine: { lineStyle: { color: "#d1d5db" } },
      axisLabel: { color: "#6b7280", fontSize: 11 },
      splitLine: { lineStyle: { color: "#e5e7eb", type: "dashed" } }
    },
    series: [{
      type: "scatter",
      symbolSize: (data: number[]) => data[2] * 2,
      data: bubbleData.map(d => ({
        name: d.name,
        value: d.value,
        itemStyle: d.itemStyle
      })),
      emphasis: {
        focus: 'series',
        label: {
          show: true,
          formatter: (params: any) => params.data.name,
          position: 'top'
        }
      }
    }]
  };
}

function generateBarChart(parsedData?: any[] | null) {
  // 파싱된 데이터가 있으면 사용, 없으면 더미 데이터
  let categories: string[] = [];
  let values: number[] = [];
  
  if (parsedData && parsedData.length > 0) {
    // 첫 번째 데이터셋 사용
    const firstData = parsedData[0];
    categories = firstData.labels || [];
    values = firstData.values || [];
    
    // 데이터가 여러 행인 경우 합산 또는 평균
    if (parsedData.length > 1) {
      const allLabels = new Set<string>();
      const valueMap = new Map<string, number[]>();
      
      parsedData.forEach(d => {
        d.labels?.forEach((label: string, idx: number) => {
          allLabels.add(label);
          if (!valueMap.has(label)) {
            valueMap.set(label, []);
          }
          if (d.values && d.values[idx] !== null) {
            valueMap.get(label)!.push(d.values[idx]);
          }
        });
      });
      
      categories = Array.from(allLabels);
      values = categories.map(label => {
        const nums = valueMap.get(label) || [];
        return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      });
    }
  }
  
  // 기본값 설정
  if (categories.length === 0) {
    categories = ["제품 A", "제품 B", "제품 C", "제품 D", "제품 E"];
    values = [120, 200, 150, 80, 70];
  }
  
  // 그라데이션 색상 객체 생성 (echarts 없이도 동작)
  const gradientColor = {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: '#83bff6' },
      { offset: 0.5, color: '#188df0' },
      { offset: 1, color: '#188df0' }
    ]
  };

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      textStyle: { color: "#1a1a1a" }
    },
    grid: {
      left: 60,
      right: 60,
      top: 40,
      bottom: 40
    },
    xAxis: {
      type: "category",
      data: categories,
      axisLine: { lineStyle: { color: "#d1d5db" } },
      axisLabel: { color: "#6b7280", fontSize: 12, rotate: categories.length > 5 ? 45 : 0 }
    },
    yAxis: {
      type: "value",
      name: "값",
      nameLocation: "middle",
      nameGap: 40,
      nameTextStyle: { color: "#6b7280" },
      axisLine: { lineStyle: { color: "#d1d5db" } },
      axisLabel: { color: "#6b7280", fontSize: 11 },
      splitLine: { lineStyle: { color: "#e5e7eb", type: "dashed" } }
    },
    series: [{
      type: "bar",
      data: values,
      itemStyle: {
        color: gradientColor
      }
    }]
  };
}

function generatePieChart(parsedData?: any[] | null) {
  // 파싱된 데이터가 있으면 사용, 없으면 더미 데이터
  let pieData: { value: number; name: string }[] = [];
  
  if (parsedData && parsedData.length > 0) {
    const labelValueMap = new Map<string, number>();
    
    parsedData.forEach(d => {
      d.labels?.forEach((label: string, idx: number) => {
        if (d.values && d.values[idx] !== null) {
          const currentValue = labelValueMap.get(label) || 0;
          labelValueMap.set(label, currentValue + d.values[idx]);
        }
      });
    });
    
    pieData = Array.from(labelValueMap.entries()).map(([name, value]) => ({
      value,
      name
    }));
  }
  
  if (pieData.length === 0) {
    pieData = [
      { value: 1048, name: "카테고리 A" },
      { value: 735, name: "카테고리 B" },
      { value: 580, name: "카테고리 C" },
      { value: 484, name: "카테고리 D" },
      { value: 300, name: "카테고리 E" }
    ];
  }
  
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      textStyle: { color: "#1a1a1a" },
      formatter: "{a} <br/>{b}: {c} ({d}%)"
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: { color: "#374151", fontSize: 12 }
    },
    series: [{
      name: "데이터",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: "#fff",
        borderWidth: 2
      },
      label: {
        show: false,
        position: "center"
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: "bold"
        }
      },
      labelLine: {
        show: false
      },
      data: pieData
    }]
  };
}

function generateLineChart(parsedData?: any[] | null) {
  // 파싱된 데이터가 있으면 사용, 없으면 더미 데이터
  let categories: string[] = [];
  let values: number[] = [];
  
  if (parsedData && parsedData.length > 0) {
    const firstData = parsedData[0];
    categories = firstData.labels || [];
    values = firstData.values || [];
    
    // 여러 행 데이터가 있으면 첫 번째 행 사용
    if (categories.length === 0 && parsedData.length > 0) {
      const allLabels = new Set<string>();
      parsedData.forEach(d => {
        d.labels?.forEach((label: string) => allLabels.add(label));
      });
      categories = Array.from(allLabels);
      
      // 각 라벨에 대한 값 합산 또는 평균
      const valueMap = new Map<string, number[]>();
      parsedData.forEach(d => {
        d.labels?.forEach((label: string, idx: number) => {
          if (!valueMap.has(label)) {
            valueMap.set(label, []);
          }
          if (d.values && d.values[idx] !== null) {
            valueMap.get(label)!.push(d.values[idx]);
          }
        });
      });
      
      values = categories.map(label => {
        const nums = valueMap.get(label) || [];
        return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      });
    }
  }
  
  if (categories.length === 0) {
    categories = ["1월", "2월", "3월", "4월", "5월", "6월"];
    values = [120, 132, 101, 134, 90, 230];
  }
  
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      textStyle: { color: "#1a1a1a" }
    },
    grid: {
      left: 60,
      right: 60,
      top: 40,
      bottom: 40
    },
    xAxis: {
      type: "category",
      data: categories,
      axisLine: { lineStyle: { color: "#d1d5db" } },
      axisLabel: { color: "#6b7280", fontSize: 12, rotate: categories.length > 5 ? 45 : 0 }
    },
    yAxis: {
      type: "value",
      name: "값",
      nameLocation: "middle",
      nameGap: 40,
      nameTextStyle: { color: "#6b7280" },
      axisLine: { lineStyle: { color: "#d1d5db" } },
      axisLabel: { color: "#6b7280", fontSize: 11 },
      splitLine: { lineStyle: { color: "#e5e7eb", type: "dashed" } }
    },
    series: [{
      type: "line",
      data: values,
      smooth: true,
      itemStyle: { color: "#5470c6" },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(84, 112, 198, 0.3)' },
            { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
          ]
        }
      }
    }]
  };
}

function generateSlopeChart(parsedData?: any[] | null) {
  const series = exampleData.map((row) => {
    const color = brandColorMap[row.manufacturer] || "#6b7280";
    return {
      name: `${row.manufacturer} - ${row.item}`,
      type: "line",
      data: [row.normal, row.sale],
      smooth: false,
      symbolSize: 8,
      lineStyle: {
        width: 2,
        type: "dotted"
      },
      itemStyle: {
        color
      },
      label: {
        show: true,
        formatter: (params: any) => {
          return params.dataIndex === 1 ? params.value : "";
        },
        position: "right",
        fontSize: 11
      }
    };
  });

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      textStyle: { color: "#1a1a1a" },
      formatter: (params: any) =>
        `${params.seriesName}<br/>${params.axisValue}: ${params.data}원/EA`
    },
    legend: {
      type: "scroll",
      orient: "vertical",
      right: 20,
      top: 20,
      textStyle: { color: "#374151", fontSize: 11 }
    },
    grid: {
      left: 60,
      right: 150,
      top: 40,
      bottom: 40
    },
    xAxis: {
      type: "category",
      data: ["일반가", "행사가"],
      axisLine: { lineStyle: { color: "#d1d5db" } },
      axisLabel: { color: "#6b7280", fontSize: 12 }
    },
    yAxis: {
      type: "value",
      name: "EA당 가격(원)",
      nameLocation: "middle",
      nameGap: 40,
      nameTextStyle: { color: "#6b7280" },
      axisLine: { lineStyle: { color: "#d1d5db" } },
      axisLabel: { color: "#6b7280", fontSize: 11 },
      splitLine: { lineStyle: { color: "#e5e7eb", type: "dashed" } }
    },
    series
  };
}

// 실제 LLM API 호출 함수 (예시 - OpenAI 사용)
export async function callLLMAPI(prompt: string, imageBase64?: string): Promise<any> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    // API 키가 없으면 로컬 로직 사용
    return generateChart(prompt);
  }

  try {
    // OpenAI API 호출 예시
    const response = await fetch('/api/generate-chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image: imageBase64,
      }),
    });

    if (!response.ok) {
      throw new Error('API 호출 실패');
    }

    const data = await response.json();
    return data.chartConfig;
  } catch (error) {
    console.error('LLM API 호출 실패:', error);
    // 실패 시 기본 차트 반환
    return generateChart(prompt);
  }
}

