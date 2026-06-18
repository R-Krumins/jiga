export default function SelectProject() {
  return (
    <div className="">
      <div className="flex gap-1">
        <input
          className="w-full bg-bg/40 rounded-lg px-2 py-0.5"
          type="text"
          placeholder="search..."
        />
      </div>

      <div className="mt-2 mb-2">
        <h1>My Project 1</h1>
        <h1>My Project 2</h1>
        <h1>My Project 3</h1>
        <h1>My Project 4</h1>
        <h1>My Project 5</h1>
      </div>
    </div>
  );
}
