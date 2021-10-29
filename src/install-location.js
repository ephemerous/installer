const body = n=>
`
<style>
	main {height: 100%; display: grid; text-align: center; place-items: center;}
	.section {margin-left: 25px;}
	a {display: inline-block; padding: 12px;}

	h1 {color: #eee;}

	.split {opacity: 0.65; font-size: 75%;}

</style>
<main>
	<div>
		<h1>Select Hosting</h1>
		<a href='#cloudflare' class='cloudflare'>Cloudflare</a> <span class='split'>or</span> <a href='#hosted' class='hosted'>Prepaid</a>
	</div>
</main>
`


class Setup {
	constructor(opts){
		
		opts = opts || {}
		this.api = opts.api

		const dom = document.createElement('main')
		dom.innerHTML = body()

		dom.querySelector('.cloudflare').onclick = e=>{
				e.preventDefault()
				const ee = new CustomEvent('select',{detail:'cloudflare'})
				dom.dispatchEvent(ee)
			}//func
		
		dom.querySelector('.hosted').onclick = e=>{
				e.preventDefault()
				const ee = new CustomEvent('select',{detail:'hosted'})
				dom.dispatchEvent(ee)
			}//func

		return dom

		}//func
	}//class

export default Setup
