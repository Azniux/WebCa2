import {withRouter} from 'next/router'
import fetch from "isomorphic-unfetch";
const apiKey = "37bfdcf596424592bbede62502efc6b5";
const defaultNewsSource = "the-irish-times";

async function getNews(url) {
  // try fetch and catch any errors
  try {
    // Make async call
    const res = await fetch(url);
    // get json data when it arrives
    const data = await res.json();
    // return json data
    return data;
  } catch (error) {
    // return error if it occurs
    return error;
  }
}

function setDate(dat){
    let now = new Date(dat);
    let months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var month = now.getUTCMonth(); //months from 0-11
  var day = now.getUTCDate();
  var year = now.getUTCFullYear();
  return `Published on ${months[month]} ${day} ${year}`;
  } //https://stackoverflow.com/questions/2013255/how-to-get-year-month-day-from-a-date-object 
  

class Article extends React.Component {
  // Constructor
  // Recieve props and initialise state properties
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    let id = this.props.router.query.id;
    let article = this.props.articles[id];
    return (
      <div>
        <div>
        <h1>{article.title}</h1>
          <section>
          <p className="author">By {article.author}</p>
          <p>{setDate(article.publishedAt)}</p>
          <img src={article.urlToImage} alt="Article Image" className="img-article" />
              <p>{article.content}</p>
              <a href={article.url}>Read More on {article.source.name}</a>
          </section>
        </div>

        <style jsx>{`
          /* CSS for this page */
          section {
            width: 80%;
            border: 1px solid gray;
            background-color: rgb(240, 248, 255);
            padding: 1em;
            clear: both;
          }
          .author {
            font-style: italic;
            font-size: 0.8em;
          }
          .img-article {
            max-width: 50%
          }
          p{
            text-align: justify;
            text-justify: inter-word;
          }
        `}</style>
      </div>
    );
  }

  //
  // Get initial data on server side using an AJAX call
  // This will initialise the 'props' for the News page
  //
  static async getInitialProps(res) {
    // Build the url which will be used to get the data
    // See https://newsapi.org/s/the-irish-times-api
    const defaultUrl = `https://newsapi.org/v2/top-headlines?sources=${res.query.source}&apiKey=${apiKey}`;

    // Get news data from the api url
    const data = await getNews(defaultUrl);

    // If the result contains and articles array then it is good so return articles
    if (Array.isArray(data.articles)) {
      return {
        articles: data.articles
      };
    }
    // Otherwise it contains an error, log and redirect to error page (status code 400)
    else {
      console.error(data);
      if (res) {
        res.statusCode = 400;
        res.end(data.message);
      }
    }
  }
} // End class

// export withRouter - enables this class to access React Router properties, e.g. to get the URl parameters
export default withRouter(Article)