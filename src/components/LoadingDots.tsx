const LoadingDots = () => {
  return (
    <div className="flex animate-pulse space-x-1 p-2">
      <div className="h-2 w-2 rounded-full bg-primary"></div>
      <div className="h-2 w-2 rounded-full bg-primary animation-delay-200"></div>
      <div className="h-2 w-2 rounded-full bg-primary animation-delay-400"></div>
    </div>
  );
};

export default LoadingDots;