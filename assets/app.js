class SomeClass {

	constructor() {
		this.posts = document.querySelector('.posts');
		this.api = 'https://jsonplaceholder.typicode.com';
		this.start = 0;
		this.limit = 10;
		this.empty = {
			id: 0,
			title: 'No posts'
		}

		//init
		this.init();
	}

	init() {
		this.getPosts();
		this.events();
	}

	events() {
		//titles
		document.addEventListener('click', event => {
			if( event.target.classList.contains('post__link') ) {
				event.preventDefault();
				const li = event.target.parentNode.parentNode.parentNode;
				const id = li.dataset.pid;
				if( li.classList.contains('post--comments') ) { //comments loaded
					li.classList.toggle('post--open');
				} else { //comments not loaded
					this.getComments(id);
					li.classList.add('post--comments');
					li.classList.toggle('post--open');
				}
			}
		});

		//pagination
		document.querySelectorAll( '.pagination a' ).forEach(item => {
			item.addEventListener('click', event => {
				event.preventDefault();
				if( event.target.classList.contains('pagination__next') ) {
					if( this.start + this.limit < 100 ) {
						this.start = this.start + this.limit;
						this.getPosts(this.start);
					}
				}
				if( event.target.classList.contains('pagination__prev') ) {
					if( this.start - this.limit >= 0 ) {
						this.start = this.start - this.limit
						this.getPosts(this.start);
					}
				}
			})
		});

		//search
		document.querySelector('.search__input').addEventListener ('keyup', event => {
			if( '' === event.target.value ) {
				this.getPosts();
			} else {
				this.getPosts(null, null, false); //get all posts
				let filtered = this.data.filter(el => {
					return el.title.includes(event.target.value);
				});
				if( 0 === filtered.length ) {
					filtered = [this.empty];
				}
				document.querySelector('.pagination').style.display = 'none'; //hide pagination
				this.buildPosts(filtered);
			}
		});
	}

	async getPosts( start = 0, limit = 10, build = true ) {
		this.posts.classList.add('loader');
		const limits = ( null != start && null != limit ) ? `?_start=${start}&_limit=${limit}` : '';
		const data = await this.makeRequest( this.api + '/posts' + limits);
		this.data = data;
		if( build ) {
			document.querySelector('.pagination').style.display = 'block'; //show pagination
			return this.buildPosts(data);
		} else {
			return data;
		}
	}

	makeRequest( api ) {
		return fetch(api)
		.then(response => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error('Connection error!');
			}
		})
		.catch(error => console.log('Error: ', error));
	}

	buildPosts( data ) {
		const list = this.posts.querySelector('.posts__list');
		list.innerHTML = ''; // clear the list :)

		if( 'undefined' !== typeof data && data.length ) {
			data.forEach(el => {
				const li = document.createElement('li');
				li.classList.add('post');
				li.dataset.pid = el.id;
				li.innerHTML = `<div class="post__header"><span class="post__id">#${el.id}</span> <h3 class="post__title"><a class="post__link" href="#">${el.title}</a></h3></div>`;
				list.appendChild(li);
			});
		} else {
			console.log('Error: empty data');
		}

		this.posts.classList.remove('loader');
	}

	async getComments( id, start = 0, limit = 10 ) {
		const post = this.posts.querySelector( `[data-pid="${id}"]` );
		post.classList.add('loader');
		const data = await this.makeRequest( this.api + '/comments?postId=' + id );
		return this.buildComments(post, data);
	}

	buildComments( post, data ) {
		const list = document.createElement('ul');
		list.classList.add('post__comments','comments');

		data.forEach(el => {
			const li = document.createElement('li');
			li.classList.add('comment');
			li.dataset.cid = el.id;
			li.innerHTML = `<h4 class="comment__title"><a class="comment__link" href="mailto:${el.email}">${el.name}</a></h4><div class="comment__desc">${el.body}</div>`;
			list.appendChild(li);
		});

		post.appendChild(list);
		post.classList.remove('loader');
	}
}

if( document.readyState !== 'loading' ) {
	new SomeClass();
} else {
	document.addEventListener('DOMContentLoaded', event => {
		new SomeClass();
	});
}