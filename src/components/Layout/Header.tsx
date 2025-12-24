import { useLocation, useIsRouting, action, redirect } from '@solidjs/router';
import IconMagnifyingGlass from "~/components/Icons/IconMagnifyingGlass";
import { searchResults } from '~/pages/results.data';
import { LogoApp } from '~/components/Icons/LogoApp';
import { useI18nContext } from '~/i18n/i18n-solid';

const searchAction = action(async (formData: FormData) => { 
  const search = formData.get('search') as string
  throw redirect(`/results?search=${search}`,{
    revalidate: searchResults.keyFor(search)
  })
})

export function Header() {
    const location = useLocation()
    const isRouting = useIsRouting()
    const { LL } = useI18nContext()

    return (
      <>
        <nav class="container mx-auto flex items-center justify-center sm:justify-around py-4 px-6 sm:px-0 gap-10 text-gray-600 has-[.member:focus]:signal">
          <a href="/" class="w-16 flex items-center mt-1 signal:animate-logoOut signal:sm:animate-none transition-size">   
            <LogoApp />
          </a>
          <form class="form-control flex items-end w-full sm:w-auto ml-0 sm:ml-4 lg:ml-0" action={searchAction} method="post">
            <fieldset class="fieldset join w-full justify-end sm:justify-start" disabled={isRouting()}>
              <input class="member input w-full text-neutral-content sm:w-96 join-item focus:delay-75 transition-size" type="search" name="search" placeholder={LL().SEARCH()} value={location?.query?.search || ""} />      
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