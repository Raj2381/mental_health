import RiskAnalytics from "./RiskAnalytics";

export default function AnalyticsDashboard({ distributionData = [], categoryData = [] }) {
  return <RiskAnalytics distributionData={distributionData} categoryData={categoryData} />;
}
