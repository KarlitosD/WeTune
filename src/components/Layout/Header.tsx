import { useLocation, useIsRouting, action, redirect } from '@solidjs/router';
import IconMagnifyingGlass from "~/components/Icons/IconMagnifyingGlass";
import { searchResults } from '~/pages/results.data';

const searchAction = action(async (formData: FormData) => { 
  const search = formData.get('search') as string
  throw redirect(`/results?search=${search}`,{
    revalidate: searchResults.keyFor(search)
  })
})

export function Header() {
    const location = useLocation()
    const isRouting = useIsRouting()
  
    return (
      <>
        <nav class="container mx-auto flex items-center justify-around p-4 gap-10 text-gray-600">
          <a href="/" class="hidden sm:block"><img src="/icon.svg" class="" alt="Logo" width={60} /></a>
          <form class="form-control ml-0 sm:ml-4 lg:ml-0" action={searchAction} method="post">
            <fieldset class="join w-full" disabled={isRouting()}>
              <input class="input input-bordered text-neutral-content w-72 sm:w-96 join-item" type="search" name="search" placeholder="Search" value={location?.query?.search || ""} />
              <button class="btn btn-neutral btn-square join-item">
                <IconMagnifyingGlass size={24} />
              </button>
            </fieldset>
          </form>
          <div class="w-14 h-1 hidden sm:block"></div>
        </nav>
      </>
    );
  };