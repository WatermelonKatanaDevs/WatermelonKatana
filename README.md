# Read this before using the API
## Authors 
- ### @Varrience,
- ### @ABICAM STUDIOS
## Version: 0.42
## DATEBY: 09/14/2023
## UPDATED: 11/28/2026 
## SUPPORTS: APPLAB & GAMELAB
## Example:
 - Send a request by using an object by using loadImage or loading pixels from a specific canvas if you don't have one
 > Unfortunately since CDO's implementation of domain whitelists for images, this service no longer works; but could if it gets allowed by CDO's maintainers. But i know the answer will be a big fat **no**. this has been updated for more functionality but will retain legacy support for the original HTTPS library
### Inline code request
```js
// Gamelab
 loadImage(yourBackend + "request?data=" + encodeURI(request), function(iamge: object) {
 })
// Applab
 drawImageURL(yourBackend + "request?data=" + encodeURI(request), function(load: boolean) {
 })
```
### Example Format for request encoding
```json
{
  "Method": "GET",
  "Url": "https://photop.exotek.co/posts",
  "Body": {
    "param1": "param1Data"
  },
  "Headers": {
    "Authorization": "bearertoken1"
  },
  "responseType": "image/png"
}
```
**Note:** that *responseType* is optional, this is **only** if you want a different output format (*image*) that what rippler provides by default to **you**
## FAQ
- Q: I keep getting garbage out responses to my requests
- A: If your using a privacy focused browser this may cause issues! Many secure browsers randomize pixel values to prevent image fingerprinting via canvas or image displays if you trust the site your running this on or are using your own make sure to relax privacy features otherwise data will never be transcoded correctly
- Q: my requests are taking too long
- A: this API was never intended to load large websites, if that is what your looking for this is not for you! Some websites may also be down which will cause the proxy to hang as it waits for a timeout this is intentional for slower websites
