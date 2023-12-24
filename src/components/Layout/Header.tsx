import { useLocation, A, useIsRouting, useNavigate } from '@solidjs/router';
import IconMagnifyingGlass from "../Icons/IconMagnifyingGlass";

export function Header() {
    const location = useLocation()
    const navigate = useNavigate()
    const isRouting = useIsRouting()
  

    const handleSearch = (event: SubmitEvent) => {
      event.preventDefault()
      const formData = new FormData(event.currentTarget as HTMLFormElement)
      const search = formData.get('search') as string
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
                <IconMagnifyingGlass size={24} />
              </button>
            </fieldset>
          </form>
        </nav>
      </>
    );
  };