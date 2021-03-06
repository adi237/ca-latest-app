const express = require("express");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const port = process.env.PORT || 3000;

const CURRENT_RES_URL = "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/submit-profile/rounds-invitations.html";

const app = express();

app.get('/fetchLatestResults', async function (req, res) {
	var results = await fetchResult();
	console.log(results);
	res.send(results);
});

app.listen(port, () => {
  console.log(`CA app listening at https://ca-latest-result.herokuapp.com:${port}/fetchLatestResults`);
});


/*
--------------------------------------------------------------------------------------------------------------
						Functions
--------------------------------------------------------------------------------------------------------------
*/

async function fetchResult(){
	var result;

	try{

		console.log("Wait");
		let dom = await JSDOM.fromURL(CURRENT_RES_URL);
		console.log("Done");

		//console.log(dom);
		//console.log(dom.window.document.querySelectorAll(".mwsgeneric-base-html")[2].querySelectorAll("p").length);
		var arrayDivs = dom.window.document.querySelectorAll(".mwsgeneric-base-html");

		if(arrayDivs[2].textContent.indexOf("Changes") == -1){
			result = createCurrentObjectFromHTML(arrayDivs[2].querySelectorAll("p"));
		}
		else{
			console.log("Changes Alert Present");
			result = createCurrentObjectFromHTML(arrayDivs[3].querySelectorAll("p"));
		}

		//console.log(result);
		return result;
	}
	catch(err){
		console.log(err)
		return err;
	}

}

function createCurrentObjectFromHTML(arrDiv){
  var tempObj = {};

  for(var index=0;index<arrDiv.length;index++){
    var childDivText = arrDiv[index].textContent.replace("Footnote","").replace("*","");
			//console.log(childDivText);
    switch(index){
      case 0:
        tempObj.number = childDivText.split("#")[1].split(" ")[0];
      break;
      case 1:
        tempObj.program = childDivText;
      break;
      case 3:
        tempObj.noOfInvitations = childDivText.split(":")[1].trim();
      break;
      case 4:
        tempObj.rankCutoff = childDivText.split(":")[1].trim();
      break;
      case 5:
        tempObj.date = new Date(childDivText.split(":")[1].replace("at", "")).getTime();
        tempObj.dateText = childDivText.split(":")[1].replace("at", "-").trim();
      break;
      case 6:
        tempObj.crsCutoff = childDivText.split(":")[1].trim();
      break;
      case 7:
        tempObj.tieBreakerDate = childDivText.substring(childDivText.indexOf(":")+1).trim();
      break;
    }
  }

  return tempObj;
}
