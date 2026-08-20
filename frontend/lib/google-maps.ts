/**
 * Shared useJsApiLoader/LoadScript config - @react-google-maps/api's loader
 * is a singleton per page session, and throws ("Loader must not be called
 * again with different options") if two components ever call it with
 * different libraries. Every component that loads the Maps JS API in this
 * app must use this same array, not its own inline one.
 */
export const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];
