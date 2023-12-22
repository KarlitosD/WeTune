import { Link, useRoutes, useLocation, Routes, A, useIsRouting, useNavigate } from '@solidjs/router';
import { FaSolidMagnifyingGlass } from "solid-icons/fa";

import { routes } from './router/routes';
import { PlaylistProvider } from './context/playlist';

type FormSearchEvent = Event & {
  submitter: HTMLElement
  target: Element;
  currentTarget: HTMLFormElement & {
    search: HTMLInputElement
  }
}

const App = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const isRouting = useIsRouting()

  const Route = useRoutes(routes)

  const handleSearch = (event: FormSearchEvent) => {
    event.preventDefault()
    const search = event.currentTarget.search.value
    navigate(`/results?search=${search}`)
  }

  return (
    <>
      <nav class="container flex items-center justify-around p-4 gap-10 text-gray-600">
        <A href="/" class="hidden sm:block"><img src="/icon.svg" class="" alt="Logo" width={60} /></A>
        <form class="form-control" onSubmit={handleSearch}>
          <fieldset class="input-group input-group-sm" disabled={isRouting()}>
            <input class="input input-bordered sm:w-96" type="search" name="search" placeholder="Search" value={location?.query?.search || ""} />
            <button class="btn btn-square">
              <FaSolidMagnifyingGlass size={24} />
            </button>
          </fieldset>
        </form>
      </nav>

      <PlaylistProvider>
          <Route />
      </PlaylistProvider>
    </>
  );
};

export default App;
