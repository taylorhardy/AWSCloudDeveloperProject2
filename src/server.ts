import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';
import * as fs from 'fs';
import * as path from 'path';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  app.get("/filteredimage", async (req:express.Request, res:express.Response) => {
    let { image_url } = req.query;

    //check to see if an image_url property was passed in
    if (!image_url) {
      console.error("image_url is required")
      return res.status(400).send("image_url is required")
    }
    //get path of file from helper function

    let filteredPath: string = await filterImageFromURL(image_url);

    let options = {
      root: '',
      dotfiles: 'deny',
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
      }
    }

    //send file back to view
    return res.sendFile(filteredPath, options, function (err) {
      if (err) {
        console.log(err)
        return res.status(500).send(err)
      } else {

        //get all files in the temp directory and push to an array with the absolute path
        fs.readdir(path.join(__dirname, 'util/tmp'), function (err, files) {
          //handling error
          if (err) {
            return console.error('Unable to scan directory: ' + err);
          }
          let fileArray: string[] = [];
          files.forEach(function (file) {
            // Do whatever you want to do with the file
            fileArray.push(path.join(path.resolve(), '/src/util/tmp', file))
          });
          //call delete util to delete files locally
          deleteLocalFiles(fileArray);
        });
      }
    })
  });

  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();