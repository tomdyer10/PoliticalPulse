return (
  <div className="container mx-auto p-4">
    {isLoading && (
      <div className="fixed top-4 right-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )}
    <h1 className="text-2xl font-bold mb-4">Analyze Survey Topic</h1>
  </div>
);