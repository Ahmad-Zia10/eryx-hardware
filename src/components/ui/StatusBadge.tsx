export function StatusBadge({ status }: { status: string }) {
  let colorClass = '';
  
  switch(status.toLowerCase()) {
    case 'pending':
      colorClass = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      break;
    case 'paid':
      colorClass = 'bg-green-500/10 text-green-400 border border-green-500/30';
      break;
    case 'failed':
    case 'cancelled':
      colorClass = 'bg-red-500/10 text-red-400 border border-red-500/30';
      break;
    case 'shipped':
      colorClass = 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      break;
    case 'delivered':
      colorClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      break;
    case 'new':
      colorClass = 'bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/30';
      break;
    case 'contacted':
    case 'resolved':
    case 'closed':
    default:
      colorClass = 'bg-[#1A1A1A] text-[#9A9A9A] border border-[#2A2A2A]';
      break;
  }

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ${colorClass} capitalize`}>
      {status}
    </span>
  );
}
