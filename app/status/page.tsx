import StatusPageClient from '@/components/StatusPageClient';

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const initialType = params.type === 'seller' ? 'seller' : 'busker';

  return <StatusPageClient initialType={initialType} />;
}
