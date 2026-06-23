import ComingSoon from "./ComingSoon";

export default async function ComingSoonPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return <ComingSoon section={section} />;
}