import React, { useCallback, useEffect, useState } from "react";
import { search } from "../../../services/searchService";
import SearchResults from "../SearchResults/SearchResults";
import FilterPanel from "../FilterPanel/FilterPanel";
import { useLocation, useNavigate } from "react-router-dom";
import { DIGITALE_DOCS_URL, routes } from "../../../services/routes";
import Pagination, {
  DEFAULT_OFFSET,
  PAGE_SIZE,
} from "../Pagination/Pagination";
import IntroSection from "../../common/IntroSection/IntroSection";
import SearchResultAlert from "../SearchResultAlert/SearchResultAlert";

const showItems = (isLoading, error, searchResult) => {
  if (isLoading) {
    return <h2>Caricamento...</h2>;
  }
  if (error) {
    return (
      <SearchResultAlert
        title="Errore di caricamento"
        message="Impossibile caricare i risultati, prova di nuovo."
      />
    );
  }
  if (!(searchResult.data && searchResult.data.length)) {
    return (
      <SearchResultAlert
        title="Nessun risultato trovato"
        message="La ricerca non ha prodotto nessun risultato, modifica i filtri o prova un'altra chiave di ricerca."
      />
    );
  }

  return (
    <div className="row mt-5">
      <div className="col-12">
        <SearchResults items={searchResult.data} />{" "}
      </div>
    </div>
  );
};

const onPageSelect = (navigate) => (filterWithPagination) => {
  navigate(routes.search(filterWithPagination));
};

function hasSearchResult(searchResult) {
  return searchResult && searchResult.data && searchResult.data.length > 0;
}

function renderPagination(isLoading, error, searchResult, filter, navigate) {
  return (
    !error &&
    !isLoading &&
    hasSearchResult(searchResult) && (
      <div className="row mt-5">
        <div className="col-12">
          <Pagination
            page={{
              totalCount: searchResult.totalCount,
              offset: searchResult.offset,
            }}
            filter={filter}
            onPageSelect={onPageSelect(navigate)}
          />
        </div>
      </div>
    )
  );
}

function renderResultCount(isLoading, error, searchResult) {
  return (
    <div className="row" data-testid="results-count">
      <div className="col-12">
        {!error && !isLoading && searchResult?.totalCount ? (
          <h2>{searchResult?.totalCount} risultati</h2>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

const SearchPage = () => {
  const [searchResult, setSearchResult] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { search: urlSearch } = useLocation();
  const navigate = useNavigate();

  const filter = routes.searchUrlToFilter(urlSearch);

  useEffect(() => {
    const doSearch = async () => {
      setLoading(true);
      setError(false);
      try {
        const result = await search(filter);
        setSearchResult(result);
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    doSearch();
  }, [urlSearch]);

  useEffect(() => {
    document.title = "Search - Team Digitale - National Data Catalog";
  });

  const onFilterUpdate = useCallback((newFilter) => {
    navigate(
      routes.search({ ...newFilter, limit: PAGE_SIZE, offset: DEFAULT_OFFSET })
    );
  }, []);

  return (
    <div data-testid="SearchPage" className="mt-5">
      <div className="container main-container pl-4 pr-4">
        <div className="row">
          <div className="col-12 col-lg-4 col-md-4" role="search">
            <FilterPanel filter={filter} onFilterUpdate={onFilterUpdate} />
          </div>
          <div className="col-12 col-lg-8 col-md-8">
            {renderResultCount(isLoading, error, searchResult)}
            {showItems(isLoading, error, searchResult)}
            {renderPagination(isLoading, error, searchResult, filter, navigate)}
          </div>
        </div>
      </div>
      <IntroSection
        title="CONTRIBUISCI"
        subtitle="Scopri come contribuire"
        primaryButtonText="Maggiori informazioni"
        primaryButtonLink={DIGITALE_DOCS_URL}
      />
    </div>
  );
};

SearchPage.propTypes = {};

SearchPage.defaultProps = {};

export default SearchPage;
