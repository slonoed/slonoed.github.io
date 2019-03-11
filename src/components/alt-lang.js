import r from 'r-dom';
import { Link } from 'gatsby';

const AltLang = ({ langKey, slug }) => {
  const label = langKey === 'ru' ? 'Читать на русском' : 'Read in English';

  return r(Link, { to: slug }, label);
};

export default AltLang;
