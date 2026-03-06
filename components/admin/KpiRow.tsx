// components/admin/KpiRow.tsx
import React from 'react';

interface KpiProps {
  label: string;
  value: string | number;
  sub: string;
  trend?: string;
  color: string;
  icon: string;
}

const KpiCard = ({ label, value, sub, trend, color, icon }: KpiProps) => (
  <div className="kpi" style={{ '--kc': color } as React.CSSProperties}>
    <div className="kpi-l">{label}</div>
    <div className="kpi-v">{value}</div>
    <div className="kpi-sub">{sub}</div>
    {trend && <div className="kpi-t up">{trend}</div>}
    <i className={`fa-solid ${icon} kpi-ico`}></i>
  </div>
);

const KpiRow = ({ stats }: { stats: any }) => {
  const kpis = [
    { label: '전체 신청', value: stats.total || 16, sub: '누적', trend: '계속 증가 중', color: 'var(--jade)', icon: 'fa-file-pen' },
    { label: '승인 대기', value: stats.pending || 0, sub: `버스커 ${stats.pendingBuskers || 0} / 셀러 ${stats.pendingSellers || 0}`, color: 'var(--gold)', icon: 'fa-hourglass-half' },
    { label: '이번 달 매출', value: `${stats.revenue || '0'}만`, sub: '결제 완료 기준', trend: '+12% vs 지난달', color: 'var(--sky)', icon: 'fa-won-sign' },
    { label: '다음 행사', value: stats.nextEventDays || '3일', sub: stats.nextEventDate || '2025-03-08', color: 'var(--lav)', icon: 'fa-calendar' },
  ];

  return (
    <div className="kpi-row">
      {kpis.map((kpi, idx) => (
        <KpiCard key={idx} {...kpi} />
      ))}
    </div>
  );
};

export default KpiRow;
