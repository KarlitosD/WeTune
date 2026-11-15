export default defineEventHandler((event) => {
    setResponseHeaders(event, {
      "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "Access-Control-Allow-Origin": process.env.ALLOW_ORIGINS ?? "*",
      'Access-Control-Allow-Credentials': 'true',
      "Access-Control-Allow-Headers": '*',
      "Access-Control-Expose-Headers": '*'
    })
    if(event.method === 'OPTIONS'){
      setResponseStatus(event, 204, "No Content.")
      return 'OK'
    }
})