interface DirectorCaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DirectorCaseDetailPage({ params }: DirectorCaseDetailPageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-10">
      <h1 className="text-2xl font-semibold text-slate-900">Case Detail</h1>
      <p className="text-sm text-slate-600">Loaded case id: {id}</p>
    </main>
  );
}
