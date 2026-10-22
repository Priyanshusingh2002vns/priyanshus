import './Showintrest.css';
export default function LoaderScreen({ card }) {
    return(
        <div className = 'loaderContainer'>
    <div className="loader" ></div>
    <h3>Verifying your {card}...</h3>
  </div>    
    )
}