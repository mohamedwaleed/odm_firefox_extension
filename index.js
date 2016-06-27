var self = require('sdk/self');

const {Cu,Cc,Ci} = require("chrome");
Cu.import("resource://gre/modules/Downloads.jsm");
Cu.import("resource://gre/modules/Task.jsm");
var exeFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
var process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);  
var Request = require("sdk/request").Request;
var { env } = require('sdk/system/environment');

function main() {
var odmHome = env.ODM_HOME;
console.log(odmHome);
  exeFile.initWithPath(odmHome);
  process.init(exeFile);

  let list ;
  let view = {

    onDownloadAdded: download => { 
        Task.spawn(function() {
          try {
            // cancel the download
            yield download.cancel(); 

            // delete the partial data
            yield download.removePartialData();

            // remove it from the list
            yield list.remove(download); 

            console.log(download.source.url);
            var url = download.source.url;



            var downloadRequest = Request({
              url: "http://localhost:45154/download?url=" + url,
              onComplete: function (response) {
                if(response.status !== 200){


                  if(exeFile.exists()){
                      process.run(false,[download.source.url],1);  // launch the executable with another file as parameter.
                  }
                }
              }
            });

            downloadRequest.get();


          } catch (ex) {
            console.error(ex);
          }
        });
      }
  };
  Task.spawn(function() {
     list = yield Downloads.getList(Downloads.ALL);

     yield list.addView(view);
  });

}

exports.main = main;
