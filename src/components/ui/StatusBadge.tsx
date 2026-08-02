export function StatusBadge({ status }: { status: string }) {
  let colorClass = '';

  switch(status.toLowerCase()) {
    case 'pending':
      colorClass = 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30';
      break;
    case 'paid':
      colorClass = 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30';
      break;
    case 'failed':
    case 'cancelled':
      colorClass = 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30';
      break;
    case 'shipped':
      // Modernist: Shipped = solid accent fill (red in marketing, gold
      // in admin — follows the scoped accent token).
      colorClass = 'bg-gold text-on-gold border border-gold';
      break;
    case 'delivered':
      // Delivered = green outline (semantic success, both scopes).
      colorClass = 'bg-transparent text-green-700 border border-green-700';
      break;
    case 'approved':
    case 'published':
      colorClass = 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30';
      break;
    case 'rejected':
      colorClass = 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30';
      break;
    case 'draft':
      colorClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30';
      break;
    case 'new':
    case 'open':
      colorClass = 'bg-gold/10 text-gold-deep dark:text-gold border border-gold/30';
      break;
    case 'in_progress':
    case 'reviewing':
    case 'quoted':
      colorClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30';
      break;
    // expired/contacted/resolved/closed and anything unknown: quiet
    // neutral. The old near-black fill made "Expired" read as more
    // severe than a failure — inactive states should recede, not shout.
    case 'expired':
    case 'contacted':
    case 'resolved':
    case 'closed':
    default:
      colorClass = 'bg-surface-sunken text-ink-muted border border-line';
      break;
  }

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-control ${colorClass} capitalize`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
