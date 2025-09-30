export default function Signup({
    handleSignup,
    credentials,
    errors,
    setCredentials,
  }) {
    return (
      <>
        <form
          onSubmit={handleSignup}
          method="POST"
          className="flex flex-col w-[500px] bg-gray-700 justify-center items-center shadow-xl  border-[1px] rounded-md border-amber-700"
        >
          <div className="p-8 w-full">
          <div className="relative w-full flex justify-center items-center p-2 m-4 text-xl">
              <label
                htmlFor="name"
                className="w-1/3 text-center text-amber-500 bg-neutral-500 rounded-l-lg p-2"
              >
                NAME
              </label>
              <div className="relative w-2/3">
                <input
                  className=" bg-white  rounded-r-lg w-full p-2"
                  value={credentials.name}
                  onChange={(e) =>
                    setCredentials((prev) => {
                      return { ...prev, name: e.target.value };
                    })
                  }
                  type="text"
                  name="name"
                  id="name"
                  autoComplete="on"
                />
                <div className="absolute text-sm left-1/2 -translate-x-1/2 text-center text-red-600 w-full">
                  {errors.name}
                </div>
              </div>
            </div>
            <div className="relative w-full flex justify-center items-center p-2 m-4 text-xl">
              <label
                htmlFor="email"
                className="w-1/3 text-center text-amber-500 bg-neutral-500 rounded-l-lg p-2"
              >
                EMAIL
              </label>
              <div className="relative w-2/3">
                <input
                  className=" bg-white  rounded-r-lg w-full p-2"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials((prev) => {
                      return { ...prev, email: e.target.value };
                    })
                  }
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="on"
                />
                <div className="absolute text-sm left-1/2 -translate-x-1/2 text-center text-red-600 w-full">
                  {errors.email}
                </div>
              </div>
            </div>
            <div className="relative w-full flex justify-center items-center text-xl p-2 m-4">
              <label
                htmlFor="email"
                className="w-1/3 text-center text-amber-500 bg-neutral-500 rounded-l-lg p-2"
              >
                PASSWORD
              </label>
              <div className="relative w-2/3">
                <input
                  className=" bg-white rounded-r-lg w-full p-2"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials((prev) => {
                      return { ...prev, password: e.target.value };
                    })
                  }
                  type="password"
                  name="password"
                  id="password"
                />
              </div>
              <div className="absolute top-full text-sm  text-center text-red-600 w-full">
                {errors.password}
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center gap-4 p-6  border-t-[1px] border-amber-700 w-full">
            <button className="bg-amber-600 p-2 rounded-md w-full" type="submit">
              SIGN UP
            </button>
          </div>
        </form>
      </>
    );
  }
  