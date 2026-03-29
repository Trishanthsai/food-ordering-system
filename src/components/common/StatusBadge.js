// src/components/common/StatusBadge.js
import React from 'react';

// Renders a coloured badge for order/payment status
const StatusBadge = ({ status }) => {
  const cls = status ? `badge badge-${status.toLowerCase()}` : 'badge';
  return <span className={cls}>{status}</span>;
};

export default StatusBadge;
