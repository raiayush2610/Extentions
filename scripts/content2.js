//alert("I am on a profile page");

//global imports (avoid these)


/////////////// * ---- GLOBAL VARIABLES ---- * /////////////////
var url = "";
const todoresp = {todo: "showPageAction"};

///////////// * GLOBAL VARIABLES ENDS HERES * /////////////////


//invoked main driver function
chrome.runtime.sendMessage(todoresp);
main();




//trigger different functionalities in main functions
function main() {
    
    ///////// VARIABLES //////////
    // define any VARIABLES below here
    var data = {};


    // Edit this string to edit the slider popup 
    // (appears on clicking extension
    // icon)
    var sliderInnerHTMLString = "\
    <!-- HEADER IS HERE -->\
    <div id='sheader'>\
    <div id='sheaderheader'></div>\
    <div id='deepscancontainer'>\
    <label id='deepscanlabel' for='deepscan'>Deepscan?<input type='checkbox' name='deepscan' id='deepscan' value='deepscan'/></label>\
    </div>\
    </div>\
    <br/>\
    \
    \
    <!-- THE BODY CONTAINER IS HERE -->\
    <div id='sbodycontainer'>\
    <br/>\
    <br/>\
    <textarea id='objectvalue'></textarea>\
    <br/>\
    <h2> Experience Section </h2>\
    <br\>\
    <textarea id='experiencetext'></textarea>\
    <br/>\
    \
    \
    ";

    //////////VARIABLES END///////////

    //expand page sections
    //expandButtons();

    //generate the DOM nodes below
    

    sliderGen(sliderInnerHTMLString);

    //DOM node generators above//


    //listener to trigger action - which is to push in/out 
    //the slider
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
      if(msg.todo == "toggle") {
        slider();
        extractExperience();
      }
    });



    //Added this as a temporary solution
    //Issue: The page doesn't fully load and content script 
    //       runs only once
    //Resolution: Added trigger through window.onscroll
    //            function to register extraction everytime
    //            a user scrolls on the webpage.
   
    data = extract();   
    var bodycontainer = document.getElementById("slider").querySelector("#sbodycontainer");
    bodycontainer = bodycontainer.querySelector("#objectvalue")
    bodycontainer.value = JSON.stringify(data)
    
    bodycontainer = document.getElementById("slider").querySelector("#sheaderheader");
    var uname = document?.querySelector('div.pv-text-details__left-panel > div > h1') || null;
    uname = uname?.textContent || "";
    bodycontainer.innerHTML = "<h1>"+uname+"</h1>";
    window.onscroll = function() {
        data = extract();
        //alert(JSON.stringify(data));
        var bodycontainer = document.getElementById("slider").querySelector("#sbodycontainer");
        bodycontainer = bodycontainer.querySelector("#objectvalue")
        bodycontainer.value = JSON.stringify(data)

        bodycontainer = document.getElementById("slider").querySelector("#sheaderheader");
        var uname = document?.querySelector('div.pv-text-details__left-panel > div > h1') || null;
        uname = uname?.textContent || "";
        bodycontainer.innerHTML = "<h1>"+uname+"</h1>";
    } 
    
  
}


//*=======================================================*//


//extract btn generator
// function extractBtnGen() {
//     var extractBtn = document.createElement("div");
//     extractBtn.textContent = "Toggle Frame";
//     extractBtn.id = "extractBtn";
//     document.querySelector("#global-nav").append(extractBtn)
// }

//slider window element generator
function sliderGen(sliderInnerHTMLString) {
    var slider = document.createElement("div");
    slider.id = "slider";
    var sliderDivInnerHTML = sliderInnerHTMLString;

    slider.innerHTML += sliderDivInnerHTML;

    document.body.prepend(slider);
}

//slider function to toggle the slider frame
function slider() {
    var slider = document.getElementById("slider");

    var styler = slider.style;
    //alert("slider" + slider);

    //toggle slider
    if(styler.width == "0px") {
        styler.width = "400px";
    } else {
        styler.width = "0px";
    }
}

//module for extracting the details
function extract() {
    /// vars go below this
    var userProfile = {};

    // vars end here

      //////////////

    // retreiving profile Section data
    const profileSection = document.querySelector(".pv-top-card");
    
    const fullNameElement = profileSection?.querySelector('h1')
    const fullName = fullNameElement?.textContent || null

    const titleElement = profileSection?.querySelector('.text-body-medium')
    var title = titleElement?.textContent || null

    var tbs = profileSection?.querySelectorAll(".text-body-small")
    const locationElement = ((tbs) ? tbs[1] : null)
    var loc = locationElement?.textContent || null

    const photoElement = document.querySelector(".pv-top-card-profile-picture__image") || profileSection?.querySelector('.profile-photo-edit__preview')
    const photo = photoElement?.getAttribute('src') || null

    const descriptionElement = document.querySelector('div#about')?.parentElement.querySelector('.pv-shared-text-with-see-more > div > span.visually-hidden')// Is outside "profileSection"
    var description = descriptionElement?.textContent || null
        

    const url = window.location.url;
    var rawProfileData = {
        fullName,
        title,
        loc,
        photo,
        description,
        url
    }

    var profileData = {
        fullName: getCleanText(rawProfileData.fullName),
        title: getCleanText(rawProfileData.title),
        location: getCleanText(rawProfileData.loc)
        // description: getCleanText(rawProfileData.description),
        // photo: rawProfileData.photo,
        // url: rawProfileData.url
    }
    ///extraction of profile data ends here///
    // extracting education section
    var nodes = $("#education-section ul > .ember-view");
    let education = [];

    for (const node of nodes) {

        const schoolNameElement = node.querySelector('h3.pv-entity__school-name');
        var schoolName = schoolNameElement?.textContent || null;
        schoolName = getCleanText(schoolName);

        const degreeNameElement = node.querySelector('.pv-entity__degree-name .pv-entity__comma-item');
        var degreeName = degreeNameElement?.textContent || null;
        degreeName = getCleanText(degreeName);

        const fieldOfStudyElement = node.querySelector('.pv-entity__fos .pv-entity__comma-item');
        var fieldOfStudy = fieldOfStudyElement?.textContent || null;
        fieldOfStudy = getCleanText(fieldOfStudy);

        // const gradeElement = node.querySelector('.pv-entity__grade .pv-entity__comma-item');
        // const grade = (gradeElement && gradeElement.textContent) ? window.getCleanText(fieldOfStudyElement.textContent) : null;

        const dateRangeElement = node.querySelectorAll('.pv-entity__dates time');

        const startDatePart = dateRangeElement && dateRangeElement[0]?.textContent || null;
        const startDate = startDatePart || null

        const endDatePart = dateRangeElement && dateRangeElement[1]?.textContent || null;
        const endDate = endDatePart || null
        
        
        education.push({
        schoolName,
        degreeName,
        fieldOfStudy,
        startDate,
        endDate
      })
    }
    //extraction of education ends here


   ///extraction of accomplishments (courses, test scores, projects,
   ///                               Languages, honor-awards)

   //first, extract out the array of nodes containing different sections
  var coursesection = document.querySelector(".courses");
  var projectsection = document.querySelector(".projects");
  var languagesection = document.querySelector(".languages");
  //var tests = acc_nodes[3]?.querySelectorAll("div > ul > li") || null;
  // var awards = acc_nodes[4]?.querySelectorAll("div > ul > li") || null;

  ///extracting different sections starting with course section

  /////COURSES/////
  var courses = []
  if(coursesection) { //if coursesection exists
    var course_nodes = coursesection.querySelectorAll("div > ul > li") || null;
    for(var nodo of course_nodes) {
      var courseName = nodo.textContent;
      courses.push(
        getCleanText(courseName)
      );
    }
  }
  /////COURSES EXTRACTION ENDS HERE/////
  
  /////PROJECTS////
  var projects = []
  if(projectsection) {
    var project_nodes = projectsection.querySelectorAll("div > ul > li") || null;
    for(var nodo of project_nodes) {
      var projectName = nodo.textContent;
      projects.push(
        getCleanText(projectName)
      );
    }
  }
  /////PROJECTS EXTRACTION ENDS HERE////


  ////LANGUAGES EXTRACTION////
  var languages = []
  if(languagesection) {
    var lang_nodes = languagesection.querySelectorAll("div > ul > li") || null;
    for(var nodo of lang_nodes) {
      var language = nodo.textContent;
      languages.push(
        getCleanText(language)
      );
    }
  }
  ////LANGUAGE EXTRACTION ENDS HERE////


  var accomplishments = {
    "courses": courses || [],
    "projects": projects || [],
    "languages": languages || []
  }

  ////Accomplishments extraction ends here


  ///VOLUNTEER EXPERIENCE EXTRACTION///
  let volunteer_experience = [];
  var volnodes = document.querySelectorAll('section.volunteering-section li');
  if(volnodes) {

    for(var nodo of volnodes) {
      var vol_title = nodo.querySelector('h3')?.textContent || null;
      var vol_company = nodo.querySelector('h4')?.textContent.replace("Company Name", "") || null;
      var vol_location = nodo.querySelector('.pv-entity__location span:nth-child(2)')?.textContent || null;
      var vol_description = nodo.querySelector('.pv-entity__extra-details')?.textContent || null;
      var date1 = nodo.querySelector('.pv-entity__date-range span:nth-child(2)')?.textContent || null;
      var date2 = nodo.querySelector('.pv-entity__bullet-item')?.textContent || null;

      volunteer_experience.push(
        {
          title: getCleanText(vol_title),
          company: getCleanText(vol_company),
          location: getCleanText(vol_location),
          description: getCleanText(vol_description),
          date1: getCleanText(date1),
          date2: getCleanText(date2)
        }
      );
    }//for-loop over volnodes
  }//if-condn to check if vonodes exists

  //add in the extracted object values here
  userProfile = {
      "profileData": profileData,
      // "education": education,
      "volunteer_experience": volunteer_experience,
      // "accomplishments" : accomplishments
  }

  
  return userProfile;
}





// Extract Experience /////

function extractExperience() {
  //defining anchors (roots from where scraping starts)
  var anchor1 = document.getElementById("experience");
  var anchor2 = document.querySelector('.pvs-list');

  var list = null;
  var exp = [];
  var roles = [];
  var company = "";

  if(anchor1 && !document.getElementById('deepscan').checked) {
    anchor1 = anchor1.nextElementSibling.nextElementSibling
    list = anchor1.querySelector('ul').children;
  } 

  if(anchor2 && document.getElementById('deepscan').checked && location.href.includes('experience')) {
    list = anchor2.children;
  } 


  
  if(list) { //if the anchor exists
    for(i=0; i<list.length; i++) {
      if(document.getElementById('deepscan').checked && !location.href.includes('experience'))
        break;
      company = "";
      roles = [];


      var elem = list[i].querySelector('div > div').nextElementSibling; //for anchor 1
      if(elem.querySelector('div > a')) {
        // condition for multiple roles in same company
        company = elem.querySelector('div > a > div > span > span')?.textContent || "";
        company = getCleanText(company);

        elem = elem.firstElementChild.nextElementSibling;
        var elems = elem.querySelector('ul').children

        for(j=0; j < elems.length; j++) {
          // traversing roles list in a company
          
          var keke = elems[j].querySelector("div > div")?.nextElementSibling || null;
          keke = keke.querySelector('div > a')

          kchilds = keke.children;
          var rname=" ", startDate=" ", endDate=" ", loc=" ";
          for(k=0; k<kchilds.length; k++) {

            //each role's details taken
            if(k==0) //role name
              rname = kchilds[k]?.querySelector('span > span').textContent || "";
            if(k==1) //role duration
              {
                var ta = kchilds[k].querySelector('span').textContent.split(/[-·]/);
                startDate = ta[0];
                endDate = ta[1];
              }
            if(k==2) //role location 
              loc= kchilds[k].querySelector('span')?.textContent || ""; 
              
           } //kloop

            roles.push({
              'id': j,
              'title': getCleanText(rname),
              'startDate': getCleanText(startDate),
              'endDate': getCleanText(endDate),
              'location': getCleanText(loc)  
            });

        } // role traversal loop


        } else { //condition when single role in one company
          elem = elem.querySelector('div > div > div > div');

          echilds = elem.children;
          var rname=" ", startDate=" ", endDate=" ", loc=" ";
          for(k=0; k<echilds.length; k++) {

            //each role's details taken
            if(k==0) //role name
              rname = echilds[k]?.querySelector('span > span').textContent || "";
            if(k==2) //role duration
              {
                var ta = echilds[k].querySelector('span').textContent.split(/[-·]/);
                startDate = ta[0];
                endDate = ta[1];
              }
            if(k==3) //role location 
              loc = echilds[k].querySelector('span')?.textContent || ""; 
            
            if(k==1) //role company title
              company = echilds[k].querySelector('span')?.textContent || "";
              if(company)
                company = company.split(/[-·]/)[0];
           } //kloop
           

           roles.push({
            'id': 0,
            'title': getCleanText(rname),
            'startDate': getCleanText(startDate),
            'endDate': getCleanText(endDate),
            'location': getCleanText(loc)  
          });



       } //single role else condn ends


       a:
       exp.push({
        'id': i,
        'company': company,
        'roles': roles
       });

      }//for loop over 'i' for each item in anchor list
  } // if list anchor exists condition

 document.getElementById('experiencetext').value = JSON.stringify(exp);
} //extract experience ends here













function getCleanText(text) {
    const regexRemoveMultipleSpaces = / +/g
    const regexRemoveLineBreaks = /(\r\n\t|\n|\r\t)/gm
  
    if (!text) return null
  
    const cleanText = text.toString()
      .replace(regexRemoveLineBreaks, '')
      .replace(regexRemoveMultipleSpaces, ' ')
      .replace('...', '')
      .replace('See more', '')
      .replace('See less', '')
      .trim()
  
    return cleanText
}


//////// * ----- UTILS ENDS -------* /////////