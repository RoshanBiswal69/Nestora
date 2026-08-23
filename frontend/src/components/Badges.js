import React from 'react';
import { Clock, CheckCircle2, AlertCircle, AlertTriangle, Flame } from 'lucide-react';

export function StatusBadge({ status }) {
  const map = {
    'Open': { cls: 'badge-open', icon: AlertCircle },
    'In Progress': { cls: 'badge-inprogress', icon: Clock },
    'Resolved': { cls: 'badge-resolved', icon: CheckCircle2 }
  };
  
  const current = map[status] || { cls: '', icon: AlertCircle };
  const Icon = current.icon;

  return (
    <span className={`badge ${current.cls}`}>
      <Icon size={13} strokeWidth={2.5} />
      <span>{status}</span>
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const map = {
    'High': { cls: 'badge-high', icon: Flame },
    'Medium': { cls: 'badge-medium', icon: AlertTriangle },
    'Low': { cls: 'badge-low', icon: CheckCircle2 }
  };

  const current = map[priority] || { cls: '', icon: AlertTriangle };
  const Icon = current.icon;

  return (
    <span className={`badge ${current.cls}`}>
      <Icon size={12} strokeWidth={2.5} />
      <span>{priority}</span>
    </span>
  );
}

export function OverdueBadge() {
  return (
    <span className="overdue-badge">
      <Clock size={12} strokeWidth={2.5} />
      <span>Overdue SLA</span>
    </span>
  );
}
