import _ from 'lodash'

/*
* request api method
*
* @param
* opts.path
* opts.method
* opts.header
* opts.data
* opts.cache
* opts.success
* opts.error
*
* TODO: add limit to qry
* */
export const api_request = (opts = {}) => { // eslint-disable-line
  const apiToken = sessionStorage.getItem('api-token') // eslint-disable-line
  const headers = {}
  if (apiToken) {
    headers['api-token'] = apiToken
  }

  let server_url = process.env.SERVER_URL // eslint-disable-line
  opts = _.merge({
    method: 'get',
    headers,
    cache: 'no-cache',
    data: {},
    success: null,
    error: null,
    path: ''
  }, opts)
  server_url += opts.path // eslint-disable-line

  const method = opts.method.toLowerCase()
  const option = {
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers
    },
    cache: opts.cache,
    method: opts.method,
    mode: 'cors'
  }
  if (method === 'post' && option.headers['Content-Type'] === 'multipart/form-data') {
    const formData = new FormData() // eslint-disable-line
    _.each(opts.data, (v, k) => {
      formData.append(k, v)
    })
    option.body = formData

    delete option.headers['Content-Type']
  } else if (method !== 'get' && method !== 'head') {
    option.body = JSON.stringify(opts.data)
  } else {
    server_url += '?' // eslint-disable-line
    _.each(opts.data, (value, key) => {
      server_url += `${key}=${encodeURIComponent(value)}&` // eslint-disable-line
    })
    server_url = server_url.replace(/&$/, '') // eslint-disable-line
  }

  return fetch(server_url, option).then((response) => { // eslint-disable-line
    if (response.status === 200) {
      // fetch success
      return response.json()
    } else {
      throw new Error(response.statusText)
    }
  }).then((data) => {
    if (data.code > 0) {
      // return data correct
      opts.success && opts.success(data.data, data)
      return data.data
    } else {
      opts.error && opts.error(data)
      throw new Error(data.error)
    }
  })
}

/*
*
* example
    upload_file(file, {
        error(e){
            console.error(e)
        }
    }).then((url)=>{
        console.log(url);
    });
*
* */
export const upload_file = async (fileObject, opts = {}) => { // eslint-disable-line
  try {
    const url = await api_request({
      path: '/upload/file',
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: {
        file: fileObject
      }
    })

    return url
  } catch (e) {
    opts.error && opts.error(e)
    throw e
  }
}
