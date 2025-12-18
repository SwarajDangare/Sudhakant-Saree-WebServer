export const getSectionColorClass = (name: string) => {
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-teal-100 text-teal-800 border-teal-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-rose-100 text-rose-800 border-rose-200',
    'bg-amber-100 text-amber-800 border-amber-200',
    'bg-emerald-100 text-emerald-800 border-emerald-200',
  ];

  // Simple hashing function to consistently get the same color for the same name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const getModernSectionColorClass = (name: string) => {
  const colors = [
    'bg-blue-500/10 text-blue-600 border-blue-200',
    'bg-purple-500/10 text-purple-600 border-purple-200',
    'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    'bg-rose-500/10 text-rose-600 border-rose-200',
    'bg-amber-500/10 text-amber-600 border-amber-200',
    'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    'bg-pink-500/10 text-pink-600 border-pink-200',
    'bg-orange-500/10 text-orange-600 border-orange-200',
    'bg-teal-500/10 text-teal-600 border-teal-200',
    'bg-violet-500/10 text-violet-600 border-violet-200',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
