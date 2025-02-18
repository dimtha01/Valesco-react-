const ProgressIndicator = ({ progress }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className="bg-blue-500 h-2 rounded-full text-center text-xs font-medium" style={{ width: `${progress}%` }}>
        {progress.toFixed(0)}%
      </div>
    </div>
  )
}

export default ProgressIndicator

