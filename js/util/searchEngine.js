if (typeof require !== 'undefined') {
  var settings = require('util/settings/settings.js')
}
// otherwise, assume window.settings exists already

var currentSearchEngine = {
  name: '',
  searchURL: '%s'
}

var defaultSearchEngine = 'DuckDuckGo'

var searchEngines = {
  DuckDuckGo: {
    name: 'DuckDuckGo',
    searchURL: 'https://duckduckgo.com/?q=%s&t=min',
    queryParam: 'q'
  },
  Google: {
    name: 'Google',
    searchURL: 'https://www.google.com/search?q=%s',
    queryParam: 'q'
  },
  Bing: {
    name: 'Bing',
    searchURL: 'https://www.bing.com/search?q=%s',
    queryParam: 'q'
  },
  Yahoo: {
    name: 'Yahoo',
    searchURL: 'https://search.yahoo.com/yhs/search?p=%s',
    queryParam: 'p'
  },
  Baidu: {
    name: 'Baidu',
    searchURL: 'https://www.baidu.com/s?wd=%s',
    queryParam: 'wd'
  },
  StartPage: {
    name: 'StartPage',
    searchURL: 'https://www.startpage.com/do/search?q=%s',
    queryParam: 'q'
  },
  Ecosia: {
    name: 'Ecosia',
    searchURL: 'https://www.ecosia.org/search?q=%s',
    queryParam: 'q'
  },
  Qwant: {
    name: 'Qwant',
    searchURL: 'https://www.qwant.com/?q=%s',
    queryParam: 'q'
  },
  Wikipedia: {
    name: 'Wikipedia',
    searchURL: 'https://wikipedia.org/w/index.php?search=%s',
    queryParam: 'search'
  },
  Yandex: {
    name: 'Yandex',
    searchURL: 'https://yandex.com/search/?text=%s',
    queryParam: 'text'
  },
  none: {
    name: 'none',
    searchURL: 'http://%s'
  }
}

for (const e in searchEngines) {
  try {
    searchEngines[e].urlObj = new URL(searchEngines[e].searchURL)
  } catch (e) {}
}

settings.listen('searchEngine', function (value) {
  if (typeof value === 'string') {
    // migrate from legacy format
    value = { name: value }
    settings.set('searchEngine', value)
  }

  if (value && value.name) {
    currentSearchEngine = searchEngines[value.name]
  } else if (value && value.url) {
    var searchDomain
    try {
      searchDomain = new URL(value.url).hostname.replace('www.', '')
    } catch (e) {}
    currentSearchEngine = {
      name: searchDomain || 'custom',
      searchURL: value.url,
      custom: true
    }
  } else {
    currentSearchEngine = searchEngines[defaultSearchEngine]
  }
})

var searchEngine = {
  getCurrent: function () {
    return currentSearchEngine
  },
  getSearch: function (url) {
    var urlObj
    try {
      urlObj = new URL(url)
    } catch (e) {
      return null
    }
    for (var e in searchEngines) {
      if (!searchEngines[e].urlObj) {
        continue
      }
      if (searchEngines[e].urlObj.hostname === urlObj.hostname && searchEngines[e].urlObj.pathname === urlObj.pathname) {
        if (urlObj.searchParams.get(searchEngines[e].queryParam)) {
          return {
            engine: searchEngines[e].name,
            search: urlObj.searchParams.get(searchEngines[e].queryParam)
          }
        }
      }
    }
    return null
  }
}

if (typeof module === 'undefined') {
  window.currentSearchEngine = currentSearchEngine
} else {
  module.exports = searchEngine
}
