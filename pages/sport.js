// This is the Link API
import Link from 'next/link';
import fetch from 'isomorphic-unfetch';
import SearchForm from '../components/SearchForm';
import Select from 'react-select';
const options = [
  { value: 'fox-sports', label: 'Fox Sports' },
  { value: 'talksport', label: 'Talksport' },
  { value: 'the-sport-bible', label: 'The Sport Bible' }
];
const apiKey = 'c3817d4c170a4361b0f75cf4200a5c5e';
async function getNews(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (error) {
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


export default class News extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newsSource: "",
      url: "",
      articles: []
    }
  }

 

  setNewsSource = (input) => {
    this.setState({
      newsSource: input,
      url: `https://newsapi.org/v2/top-headlines?sources=${input}&apiKey=${apiKey}`
    })
  }

  searchNewsApi = (event) => {
    this.setState({
      newsSource: `${event.target.innerText}`,
      url: `https://newsapi.org/v2/${event.target.name}&apiKey=${apiKey}`
    })
  }

  setDropDown = (option) => {
    this.setState({
      newsSource: option.value,
      url: `https://newsapi.org/v2/top-headlines?sources=${option.value}&apiKey=${apiKey}`
    })
  } //Takes the options value

  async componentDidUpdate(prevPops, prevState)
  {
    if(this.state.url !== prevState.url)
    {
      const data = await getNews(this.state.url);
      if(Array.isArray(data.articles))
      {
        this.state.articles = data.articles;
        this.setState(this.state);
      }
    }
  }

  

  render() {
    if(this.state.articles.length == 0)
      this.state.articles = this.props.articles

    return (
      <div>
      <SearchForm setNewsSource={this.setNewsSource} />
      <Select
        onChange={this.setDropDown}
        options={options}
      />
      <ul className="newsMenu">
        <li><a href="#" onClick={this.searchNewsApi} name="top-headlines?country=ie">Top Headlines Ireland</a></li>
        <li><a href="#" onClick={this.searchNewsApi} name="top-headlines?country=ie&category=business">Top Business News Ireland</a></li>
        <li><a href="#" onClick={this.searchNewsApi} name="top-headlines?country=ie&category=weather">Weather Ireland</a></li>
      </ul>
      <div className="newsItems">
      {this.state.articles.map((article, index) => (
        <section>
          <h3>{article.title}</h3>
          <p className="author">{article.author} {setDate(article.publishedAt)}</p>
          <img src={article.urlToImage} alt="No Image" className="img-article" />
          <p>{article.description}</p>
          <p>{article.content}</p>
          {article.source.id !== null &&
            <p><Link href={`/articles?id=${index}&source=${article.source.id}`}><a>Read More</a></Link></p>
          }
          <p><a href={article.url}>Read More on {article.source.name}</a></p>
        </section>
      ))}
      </div>
      <style jsx>{`
              /* CSS for this page */
              section {
                width: 90%;
                border: 1px solid gray;
                background-color: rgb(240, 248, 255);
                padding: 1em;
                margin-left: auto;
                margin-right: auto;
                margin: 1em;
              }

            .author {
                font-style: italic;
                font-size: 0.8em;
              }
            .img-article {
                max-width: 90%;
                margin-left: auto;
                margin-right: auto;
              }

            .newsMenu {
              display: flex;
              flex-direction: row;
              margin: 0;
              padding: 0;
              margin-top: 20px;
            }
            .newsMenu li {
              display: inline-table;
              padding-left: 20px;
            }

            .newsMenu li a {
              font-size: 1em;
              color: blue;
              display: block;
              text-decoration: none;
            }

            .newsMenu li a:hover {
              color: rgb(255, 187, 0);
              text-decoration: underline;
            }
          `}</style>
      </div>
    )
  }
  static async getInitialProps(req) {
    let source = 'bbc-sport'
    if(typeof req.query.source != "undefined")
      source=req.query.source;
    const url = `https://newsapi.org/v2/top-headlines?sources=${source}&apiKey=${apiKey}`;
    const data = await getNews(url);
  
    if(Array.isArray(data.articles))
    {
      return{
        articles: data.articles,
        source: source
      }
    }
    else {
      console.error(data);
      req.statusCode = 400
      req.end(data.message);
    }
  }
}