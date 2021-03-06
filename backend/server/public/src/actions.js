import { serialize } from "utils.js";
import { debounce } from "lodash";
import history from "./history.js";

export const URL_ROOT =
  window.location.href.indexOf("localhost") > -1 ? "http://localhost:3000" : "";

export const NEW_ADS = "new_ads";
export const newAds = ads => ({
  type: NEW_ADS,
  value: ads
});

export const GOT_THAT_AD = "GOT_THAT_AD";
export const receiveOneAd = ad => ({
  type: GOT_THAT_AD,
  ad: ad
});

export const REQUESTING_ONE_AD = "REQUESTING_ONE_AD";
export const requestingOneAd = ad_id => ({
  type: REQUESTING_ONE_AD,
  ad_id: ad_id
});

export const GOT_RECENT_GROUPED_ATTR = "GOT_RECENT_GROUPED_ATTR";
export const receiveRecentGroupedAttr = groupedAttrs => ({
  type: GOT_RECENT_GROUPED_ATTR,
  groupedAttrs
});

export const REQUESTING_RECENT_GROUPED_ATTR = "REQUESTING_RECENT_GROUPED_ATTR";
export const requestingRecentGroupedAttr = () => ({
  type: REQUESTING_RECENT_GROUPED_ATTR
});

export const RECEIVE_STATES_AND_DISTRICTS = "RECEIVE_STATES_AND_DISTRICTS";
export const receiveStatesAndDistricts = statesAndDistricts => ({
  type: RECEIVE_STATES_AND_DISTRICTS,
  statesAndDistricts
});

export const REQUESTING_STATES_AND_DISTRICTS =
  "REQUESTING_STATES_AND_DISTRICTS";
export const requestingStatesAndDistricts = () => ({
  type: REQUESTING_STATES_AND_DISTRICTS
});

export const GOT_SUMMARY = "GOT_SUMMARY";
export const receivedSummary = summary => ({
  type: GOT_SUMMARY,
  summary
});

export const REQUESTING_SUMMARY = "REQUESTING_SUMMARY";
export const requestingSummary = () => ({ type: REQUESTING_SUMMARY });

export const SET_LANG = "set_lang";
export const setLang = lang => ({
  type: SET_LANG,
  value: lang
});

export const NEW_SEARCH = "new_search";
export const newSearch = query => ({
  type: NEW_SEARCH,
  value: query
});

const asyncResetPage = action => {
  return (dispatch, getState) => {
    dispatch(setPage(0));
    return async(action)(dispatch, getState);
  };
};

const async = action => {
  return (dispatch, getState) => {
    dispatch(action);
    return getAds()(dispatch, getState);
  };
};
export const fetchSearch = query => asyncResetPage(newSearch(query));

export const throttledDispatch = debounce((dispatch, input) => {
  dispatch(fetchSearch(input));
}, 750);
// throttledDispatchAny(dispatch, fetchSearch, input) // TODO

export const throttledDispatchAny = debounce((dispatch, func, input) => {
  dispatch(func(input));
}, 750);

export const BATCH = "batch";
export const batch = (...actions) => ({
  type: BATCH,
  actions: actions
});

const a = type => arg => ({ type, value: arg });
export const NEW_ENTITIES = "new_entities";
export const NEW_ADVERTISERS = "new_advertisers";
export const NEW_TARGETS = "new_targets";
export const NEW_STATES = "new_states";
export const NEW_PARTIES = "new_parties";
export const NEW_DISTRICTS = "new_districts";
export const newEntities = a(NEW_ENTITIES);
export const newAdvertisers = a(NEW_ADVERTISERS);
export const newTargets = a(NEW_TARGETS);
export const newStates = a(NEW_STATES);
export const newParties = a(NEW_PARTIES);
export const newDistricts = a(NEW_DISTRICTS);

// resets advertisers, targets, entities, states, districts, parties
export const CLEAR_ALL_FILTERS = "clear_all_filters";
export const clearAllFilters = () => ({
  type: CLEAR_ALL_FILTERS
});

export const FILTER_ENTITY = "filter_entity";
export const FILTER_ADVERTISER = "filter_advertiser";
export const FILTER_TARGET = "filter_target";
export const FILTER_STATE = "filter_states";
export const FILTER_PARTY = "filter_parties";
export const FILTER_DISTRICT = "filter_districts";
export const filterEntity = a(FILTER_ENTITY);
export const filterAdvertiser = a(FILTER_ADVERTISER);
export const filterTarget = a(FILTER_TARGET);
export const filterState = a(FILTER_STATE);
export const filterParty = a(FILTER_PARTY);
export const filterDistrict = a(FILTER_DISTRICT);
export const fetchEntity = e => asyncResetPage(filterEntity(e));
export const fetchAdvertiser = a => asyncResetPage(filterAdvertiser(a));
export const fetchTarget = t => asyncResetPage(filterTarget(t));
export const fetchState = e => asyncResetPage(filterState(e));
export const fetchParty = a => asyncResetPage(filterParty(a));
export const fetchDistrict = t => asyncResetPage(filterDistrict(t));

export const TOGGLE_TARGET = "toggle_target";
export const TOGGLE_ADVERTISER = "toggle_advertiser";
export const TOGGLE_ENTITY = "toggle_entity";
export const RESET_DROPDOWNS = "reset_dropdowns";
export const toggleTarget = () => ({ type: TOGGLE_TARGET });
export const toggleAdvertiser = () => ({ type: TOGGLE_ADVERTISER });
export const toggleEntity = () => ({ type: TOGGLE_ENTITY });
export const resetDropdowns = () => ({ type: RESET_DROPDOWNS });

export const CHANGE_POLITICAL_PROBABILITY = "change_poliprob";
export const filterbyPoliticalProbability = a(CHANGE_POLITICAL_PROBABILITY);
export const changePoliticalProbability = t =>
  asyncResetPage(filterbyPoliticalProbability(t));

export const NEXT_PAGE = "next_page";
export const PREV_PAGE = "prev_page";
export const SET_PAGE = "set_page";
export const SET_TOTAL = "set_total";
export const nextPage = () => ({ type: NEXT_PAGE });
export const fetchNextPage = () => async(nextPage());
export const prevPage = () => ({ type: PREV_PAGE });
export const fetchPrevPage = () => async(prevPage());
export const setPage = page => ({ type: SET_PAGE, value: page });
export const fetchPage = page => async(setPage(page));
export const setTotal = total => ({ type: SET_TOTAL, value: total });

export const getOneAd = (ad_id, url = `${URL_ROOT}/fbpac-api/ads`) => {
  if (!ad_id) return () => null;

  let path = `${url}/${ad_id}`;
  return dispatch => {
    dispatch(requestingOneAd(ad_id));
    return fetch(path, { method: "GET", credentials: "include" })
      .then(res => res.json())
      .then(ad => {
        dispatch(receiveOneAd(ad));
      });
  };
};

export const getStatesAndDistricts = () => {
  let path = `${URL_ROOT}/fbpac-api/states_and_districts`;
  return (dispatch, getState) => {
    let state = getState();

    if (state.lang) {
      path = path + `?lang=${state.lang}`;
    }
    dispatch(requestingStatesAndDistricts());
    return fetch(path, {
      method: "GET",
      credentials: "include",
      redirect: "follow"
    })
      .then(resp => {
        if (resp.redirected === true) {
          window.location.href = `${URL_ROOT}/fbpac-api/partners/sign_in`;
          return null;
        }
        return resp.json();
      })
      .then(resp => {
        dispatch(receiveStatesAndDistricts(resp));
      });
  };
};

export const getGroupedAttrs = (
  groupingKind = "advertiser",
  recent = "by",
  root_url = `${URL_ROOT}/fbpac-api/ads`
) => {
  let path = `${root_url}/${recent}_${groupingKind + "s"}`;
  return (dispatch, getState) => {
    let state = getState();
    if (state.lang) {
      path = path + `?lang=${state.lang}`;
    }
    dispatch(requestingRecentGroupedAttr());
    return (
      fetch(path, {
        method: "GET",
        credentials: "include",
        redirect: "follow" // in case we get redirected to the login page.
      })
        .then(resp => {
          if (resp.redirected === true) {
            window.location.href = `${URL_ROOT}/fbpac-api/partners/sign_in`;
            return null;
          }
          return resp.json();
        })
        // .then(res => res.json())
        .then(resp => {
          dispatch(receiveRecentGroupedAttr(resp));
        })
    );
  };
};

export const getSummary = (root_url = `${URL_ROOT}/fbpac-api/ads`) => {
  let path = `${root_url}/summarize`;
  return (dispatch, getState) => {
    let state = getState();
    if (state.lang) {
      path = path + `?lang=${state.lang}`;
    }
    dispatch(requestingSummary());
    return (
      fetch(path, {
        method: "GET",
        credentials: "include",
        redirect: "follow" // in case we get redirected to the login page.
      })
        .then(resp => {
          if (resp.redirected === true) {
            window.location.href = `${URL_ROOT}/fbpac-api/partners/sign_in`;
            return null;
          }
          return resp.json();
        })
        // .then(res => res.json())
        .then(resp => {
          dispatch(receivedSummary(resp));
        })
    );
  };
};

export const getAds = (url = `${URL_ROOT}/fbpac-api/ads`) => {
  return (dispatch, getState) => {
    let state = getState();
    const params = serialize(state);
    let path = `${url}?${params.toString()}`;

    let query = params.toString().length > 0 ? `?${params.toString()}` : "";
    let new_url = `${location.pathname}${query}`;
    if (location.search !== query) {
      // this history.push is just for when the state got changed  via dropdowns/searches
      // and then we got ads back
      // and then we changed the URL to match
      // we skip the history.push if location.search === query
      // which is true when we got here via a <Link>
      // mutating history OUTSIDE of react-router gets things very confused and you end up with dumb URLs.
      history.push({ search: query }, "", new_url);
    }
    return fetch(path, { method: "GET", credentials: "include" })
      .then(res => res.json())
      .then(ads => {
        dispatch(
          batch(
            newAds(ads.ads),
            newEntities(ads.entities),
            newAdvertisers(ads.advertisers),
            newTargets(ads.targets),
            setTotal(ads.total),
            setPage(parseInt(params.get("page"), 0) || 0)
          )
        );
      });
  };
};

// Admin actions
export const HIDE_AD = "hide_ad";
export const hideAd = ad => ({
  type: HIDE_AD,
  id: ad.id
});

export const suppressAd = ad => {
  return dispatch => {
    dispatch(hideAd(ad));
    return fetch(`${URL_ROOT}/fbpac-api/ads/${ad.id}/suppress`, {
      method: "PUT",
      body: ad.id,
      credentials: "include"
    }).then(resp => {
      if (!resp.ok) {
        window.location = `${URL_ROOT}/fbpac-api/partners/sign_in`;
      }
    });
  };
};
