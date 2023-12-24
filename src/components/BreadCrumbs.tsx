import { useLocation } from 'react-router-dom';

const capitalizeFirstLetter = (string: string) => {
  return string && string.charAt(0).toUpperCase() + string.slice(1);
};

const BreadCrumbs: React.FC = () => {
  const location = useLocation();
  const currentPage = location.pathname.split('/')[2];

  return (
    <nav className="w-full rounded-md mb-5">
      <ol className="list-reset flex">
        <li>
          <a
            href="/admin"
            className="text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
          >
            Home
          </a>
        </li>
        <li>
          <span className="mx-2 text-neutral-500 dark:text-neutral-400">/</span>
        </li>
        <li className="text-neutral-500 dark:text-neutral-400">
          {capitalizeFirstLetter(currentPage)}
        </li>
      </ol>
    </nav>
  );
};

export { BreadCrumbs };
