export default function Switch({ checked, onChange }: { checked: boolean; onChange: (v:boolean)=>void }) {
  return (
    <div onClick={()=>onChange(!checked)} className={`w-12 h-6 rounded-full cursor-pointer transition ${checked?"bg-green-500":"bg-slate-300"}`}>
      <div className={`h-6 w-6 bg-white rounded-full shadow -mt-px transition ${checked?"translate-x-6":"translate-x-0"}`} />
    </div>
  );
}