const express = require('express');
const router = express.Router();
const response = require('./../util/response');
const postmark = require("postmark");
const viewMeta = require('./../util/view-meta');
const textService = require('./../util/text-service');
// const FavroApi = require('./../util/favro-api');

router.post('/', function(req, res, next) {
  const {name, email, country, message, budget, tags, company} = req.body;
  const client = new postmark.ServerClient("0afdeda0-fe66-47fe-99e6-b131bef1215f");

  const text = ['Website Inquery'];
  text.push('E-Mail: ' + email);
  text.push('Name: ' + name);
  text.push('Message: ' + message);
  text.push('Country: ' + country);
  text.push('Budget: ' + budget);
  text.push('Tags: ' + tags.join(', '));
  text.push('Company: ' + company);

  client.sendEmail({
    "From": "hey@17grad.com",
    "To": "hej@17grad.com",
    "Subject": "Website Inquery",
    "TextBody": text.join("\n"),
    "MessageStream": "outbound"
  });
  // const favro = new FavroApi(process.env.FAVRO_AUTH);
  // favro.createCard({
  //   name, email, company, country, message
  // });

  res.json({
    'success': true
  });
});

router.get('/', function(req, res, next) {
  const texts = textService.get(res.locals.locale);


  const prefetchViewStyles = res.locals.prefetchViewStyles;
  prefetchViewStyles.splice(prefetchViewStyles.indexOf('view-contact'), 1);

  response(req, res, 'contact', {
    ...viewMeta('contact', res.locals.locale),
    tags: [
      'Website',
      'Branding',
      'App',
      'E-Commerce',
      'Corporate',
      'Promotion',
      'SaaS Product',
      'Motion Design',
      'Landing Page',
      'User Experience',
      'User Interface',
      'Realtime 3D',
      texts['contact.form.tag-other']
    ]
  });
});

module.exports = router;
