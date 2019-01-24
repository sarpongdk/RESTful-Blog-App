const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');
const app = express();

// mongoose/model config
mongoose.connect('mongodb://localhost/restful_blog_app' , {useNewUrlParser: true});

const blogSchema = new mongoose.Schema({
    title: {type: String},
    image: {type: String},
    body: {type: String},
    created: {type: Date, default: Date.now}
});

const Blog = mongoose.model('Blog', blogSchema);

// app config
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSanitizer());
app.use(methodOverride('_method'));

// root route
app.get('/', (req, res) => {
    res.redirect('/blogs');
});

// restful routes
// index route
app.get('/blogs', (req, res) => {
    Blog.find({}, (err, blogs) => {
        if (err) {
            console.log(err);
        } else {
            res.render('index.ejs', {blogs: blogs})
        }
    });
});

// new route
app.get('/blogs/new', (req, res) => {
    res.render('new.ejs');
});

// create route
app.post('/blogs', (req, res) => {
    var data = req.body.blog;
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(data, (err, newBlog) => {
        if (err) {
            res.render('new.ejs');
        } else {
            res.redirect('/blogs');
        }
    });
});

// show route
app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) {
            res.redirect('/blogs');
        } else {
            res.render('show.ejs', {blog: foundBlog});
        }
    });
});

// edit route
app.get('/blogs/:id/edit', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) {
            res.redirect('/blogs');
        } else {
            res.render('edit.ejs', {blog: foundBlog});
        }
    });
});

// update route
app.put('/blogs/:id', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if (err) {
            res.redirect('/blogs');
        } else {
            res.redirect(`/blogs/${req.params.id}`);
        }
    });
});

// delete route
app.delete('/blogs/:id', (req, res) => {
    Blog.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            res.redirect('/blogs');
        } else {
            res.redirect('/blogs');
        }
    });
});

// start server
app.listen(app.get('port'), () => {
    console.log('Server is running!');
});

