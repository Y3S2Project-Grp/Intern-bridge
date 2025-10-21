import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

interface AnalyticsChartProps {
  type: 'line' | 'bar' | 'pie';
  data: any;
  title?: string;
  height?: number;
  width?: number;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  type,
  data,
  title,
  height = 220,
  width = Dimensions.get('window').width - 40,
}) => {
  const chartConfig = {
    backgroundColor: '#1E40AF',
    backgroundGradientFrom: '#1E40AF',
    backgroundGradientTo: '#3B82F6',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#FFA726',
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={data}
            width={width}
            height={height}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withVerticalLines={false}
            withHorizontalLines={false}
          />
        );
      case 'bar':
        return (
          <BarChart
            data={data}
            width={width}
            height={height}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
            withHorizontalLabels={true}
          />
        );
      case 'pie':
        return (
          <PieChart
            data={data}
            width={width}
            height={height}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>
    </View>
  );
};

// Example data structures for different chart types
export const sampleLineData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43],
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      strokeWidth: 2,
    },
  ],
};

export const sampleBarData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99],
    },
  ],
};

export const samplePieData = [
  {
    name: 'Youth',
    population: 2150,
    color: '#FF6B6B',
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  },
  {
    name: 'Organizations',
    population: 280,
    color: '#4ECDC4',
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  },
  {
    name: 'Admins',
    population: 12,
    color: '#45B7D1',
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  },
];

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    borderRadius: 16,
  },
});

export default AnalyticsChart;