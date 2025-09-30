import { Link } from "react-router";
export default function NotFound() {
  return (
    <>
      <div className="flex flex-col gap-4 w-full h-[100vh] justify-center items-center">
        <h1 className="text-4xl text-neutral-300">Page not found</h1>
        <p>
          Click 
          <span className="text-neutral-600">
            <Link to="/dashboard/home"> here </Link>
          </span>
          to return to home
        </p>
      </div>
    </>
  );
}
