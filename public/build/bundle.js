
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Highlight.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/components/Highlight.svelte";

    function create_fragment$1(ctx) {
    	let audio_1;
    	let audio_1_src_value;
    	let t0;
    	let div;
    	let span;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			audio_1 = element("audio");
    			t0 = space();
    			div = element("div");
    			span = element("span");
    			t1 = text(/*text*/ ctx[0]);
    			attr_dev(audio_1, "preload", "auto");
    			if (!src_url_equal(audio_1.src, audio_1_src_value = audioUrl)) attr_dev(audio_1, "src", audio_1_src_value);
    			audio_1.loop = true;
    			add_location(audio_1, file$1, 99, 0, 2460);
    			attr_dev(span, "class", "highlight svelte-18e6fr3");
    			add_location(span, file$1, 111, 2, 2649);
    			attr_dev(div, "class", "highlight-wrapper svelte-18e6fr3");
    			add_location(div, file$1, 106, 0, 2541);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, audio_1, anchor);
    			/*audio_1_binding*/ ctx[6](audio_1);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseenter", /*handleMouseEnter*/ ctx[2], false, false, false, false),
    					listen_dev(div, "mouseleave", handleMouseLeave, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) set_data_dev(t1, /*text*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(audio_1);
    			/*audio_1_binding*/ ctx[6](null);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleMouseLeave(event) {
    	document.body.style.backgroundImage = 'none';
    	const column = event.target.closest('.column');

    	if (column) {
    		column.style.color = 'black';
    	}

    	const tooltip = document.querySelector('.tooltip-content');

    	if (tooltip) {
    		tooltip.remove();
    	}
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Highlight', slots, []);
    	let { text } = $$props;
    	let { imageUrl = 'https://picsum.photos/1200/801' } = $$props;
    	let { color = 'inherit' } = $$props;
    	let { hoverText = '' } = $$props;
    	let audio;

    	function handleMouseEnter(event) {
    		document.body.style.backgroundImage = `url('${imageUrl}')`;
    		const column = event.target.closest('.column');
    		const columnContent = column?.querySelector('.column-content');

    		if (column) {
    			column.style.color = color;
    		}

    		if (hoverText && columnContent && !document.querySelector('.tooltip-content')) {
    			const tooltip = document.createElement('div');
    			tooltip.className = 'tooltip-content';
    			tooltip.textContent = hoverText;
    			columnContent.appendChild(tooltip);
    		}

    		if (audio) {
    			$$invalidate(1, audio.currentTime = 0, audio);
    			audio.play().catch(e => console.log('Audio play failed:', e));
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (text === undefined && !('text' in $$props || $$self.$$.bound[$$self.$$.props['text']])) {
    			console_1$1.warn("<Highlight> was created without expected prop 'text'");
    		}
    	});

    	const writable_props = ['text', 'imageUrl', 'color', 'hoverText'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Highlight> was created with unknown prop '${key}'`);
    	});

    	function audio_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			audio = $$value;
    			$$invalidate(1, audio);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('imageUrl' in $$props) $$invalidate(3, imageUrl = $$props.imageUrl);
    		if ('color' in $$props) $$invalidate(4, color = $$props.color);
    		if ('hoverText' in $$props) $$invalidate(5, hoverText = $$props.hoverText);
    	};

    	$$self.$capture_state = () => ({
    		text,
    		imageUrl,
    		color,
    		hoverText,
    		audio,
    		handleMouseEnter,
    		handleMouseLeave
    	});

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('imageUrl' in $$props) $$invalidate(3, imageUrl = $$props.imageUrl);
    		if ('color' in $$props) $$invalidate(4, color = $$props.color);
    		if ('hoverText' in $$props) $$invalidate(5, hoverText = $$props.hoverText);
    		if ('audio' in $$props) $$invalidate(1, audio = $$props.audio);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, audio, handleMouseEnter, imageUrl, color, hoverText, audio_1_binding];
    }

    class Highlight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			text: 0,
    			imageUrl: 3,
    			color: 4,
    			hoverText: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Highlight",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get text() {
    		throw new Error("<Highlight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Highlight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imageUrl() {
    		throw new Error("<Highlight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imageUrl(value) {
    		throw new Error("<Highlight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Highlight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Highlight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverText() {
    		throw new Error("<Highlight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverText(value) {
    		throw new Error("<Highlight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let div29;
    	let div28;
    	let div1;
    	let div0;
    	let t0;
    	let div3;
    	let p0;
    	let t2;
    	let div2;
    	let t3;
    	let highlight0;
    	let t4;
    	let t5;
    	let div5;
    	let div4;
    	let t6;
    	let highlight1;
    	let t7;
    	let t8;
    	let div7;
    	let div6;
    	let t9;
    	let highlight2;
    	let t10;
    	let t11;
    	let div9;
    	let div8;
    	let t12;
    	let highlight3;
    	let t13;
    	let t14;
    	let div11;
    	let div10;
    	let t15;
    	let highlight4;
    	let t16;
    	let t17;
    	let div13;
    	let div12;
    	let t18;
    	let highlight5;
    	let t19;
    	let t20;
    	let div15;
    	let div14;
    	let t21;
    	let highlight6;
    	let t22;
    	let t23;
    	let div17;
    	let div16;
    	let t24;
    	let highlight7;
    	let t25;
    	let t26;
    	let div19;
    	let div18;
    	let t27;
    	let highlight8;
    	let t28;
    	let t29;
    	let div21;
    	let div20;
    	let t30;
    	let highlight9;
    	let t31;
    	let t32;
    	let div23;
    	let div22;
    	let t33;
    	let highlight10;
    	let t34;
    	let t35;
    	let div25;
    	let div24;
    	let t36;
    	let highlight11;
    	let t37;
    	let highlight12;
    	let t38;
    	let t39;
    	let div27;
    	let div26;
    	let p1;
    	let t40;
    	let a;
    	let t42;
    	let current;

    	highlight0 = new Highlight({
    			props: {
    				text: "listening",
    				imageUrl: "listening.JPG",
    				color: "white",
    				audioUrl: "/removethedefender.mov",
    				hoverText: "remove the defender by Yaktus; if you don't hear anything, click on the webpage and hover again"
    			},
    			$$inline: true
    		});

    	highlight1 = new Highlight({
    			props: {
    				text: "You are at an intersection",
    				imageUrl: "crossing.jpeg",
    				color: "yellow"
    			},
    			$$inline: true
    		});

    	highlight2 = new Highlight({
    			props: {
    				text: "forgotten parts of myself",
    				imageUrl: "forgetting.jpeg",
    				color: "brown",
    				hoverText: "evident in my first blog post ever"
    			},
    			$$inline: true
    		});

    	highlight3 = new Highlight({
    			props: {
    				text: "website",
    				imageUrl: "website.png",
    				color: "blue",
    				hoverText: "connie.surf"
    			},
    			$$inline: true
    		});

    	highlight4 = new Highlight({
    			props: {
    				text: "real",
    				imageUrl: "wall.jpeg",
    				color: "darkgreen",
    				hoverText: "wall text: poetry blushes but never runs away"
    			},
    			$$inline: true
    		});

    	highlight5 = new Highlight({
    			props: {
    				text: "beautiful",
    				imageUrl: "seen.png",
    				color: "pink",
    				hoverText: "snippet of a slide from a comics workshop"
    			},
    			$$inline: true
    		});

    	highlight6 = new Highlight({
    			props: {
    				text: "machine yearning",
    				imageUrl: "yearn.png",
    				color: "blue",
    				hoverText: "not linked anywhere because they’re all 20% done… I mostly wanted an excuse to quickly figure out new technologies, for example: machineyearning.glitch.me was experiment I did to use a websocket where you can pass notes to someone, the UI feedback is haphazard because of.. a skill issue…"
    			},
    			$$inline: true
    		});

    	highlight7 = new Highlight({
    			props: {
    				text: "record",
    				imageUrl: "ping.jpg",
    				color: "maroon",
    				hoverText: "It was cool later hearing about this process as “pings” from Laurel Schwulst’s talk earlier this year. Noticing as a way of practice."
    			},
    			$$inline: true
    		});

    	highlight8 = new Highlight({
    			props: {
    				text: "run out of time",
    				imageUrl: "time.jpeg",
    				color: "navy"
    			},
    			$$inline: true
    		});

    	highlight9 = new Highlight({
    			props: {
    				text: "lighter.",
    				imageUrl: "lighter.jpeg",
    				color: "black"
    			},
    			$$inline: true
    		});

    	highlight10 = new Highlight({
    			props: {
    				text: "'The Creative Act'",
    				imageUrl: "creativeact.jpg",
    				color: "goldenrod"
    			},
    			$$inline: true
    		});

    	highlight11 = new Highlight({
    			props: {
    				text: "extra space",
    				imageUrl: "sell.jpeg",
    				color: "white"
    			},
    			$$inline: true
    		});

    	highlight12 = new Highlight({
    			props: {
    				text: "tabled",
    				imageUrl: "dataset.jpeg",
    				color: "white",
    				hoverText: "at the dataset farmer's market!"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div29 = element("div");
    			div28 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			p0 = element("p");
    			p0.textContent = "Please click on this webpage once to enable the audio effect";
    			t2 = space();
    			div2 = element("div");
    			t3 = text("One night I found myself \n        ");
    			create_component(highlight0.$$.fragment);
    			t4 = text("\n        to a song from a college indie band whose concert I attended at the basement of the co-op next to mine. \n        to the looping bass, the loose melody and voice of the singer, I felt an indescribable feeling wash over me. \n        Eyes soft, imperceptibly so, reaching for something just beyond my fingertips.");
    			t5 = space();
    			div5 = element("div");
    			div4 = element("div");
    			t6 = text("The day prior I had met up with some people from the co-op, the first time this particular group of people had met in three years. An intersection of time - do you think you can be in two places at once? \n        ");
    			create_component(highlight1.$$.fragment);
    			t7 = text("\n        and you look both ways before crossing.");
    			t8 = space();
    			div7 = element("div");
    			div6 = element("div");
    			t9 = text("The song traced a bittersweetness in my memory - the lingering desperation I had in college for approval and foolish belief that if I achieved certain goals I would finally become the person I wanted to be without looking any closer. I had \n        ");
    			create_component(highlight2.$$.fragment);
    			t10 = text("\n        as a result. With no one around to witness them, it was if they were never there.");
    			t11 = space();
    			div9 = element("div");
    			div8 = element("div");
    			t12 = text("Three years since is so much time, yet so little. I had done so much, yet so little, but at the very least I was slowly becoming myself again. Towards the end of 2023, I made a  \n        ");
    			create_component(highlight3.$$.fragment);
    			t13 = text("\n        as a declaration that I was going to make art and share it and it was going to be bad and inconsistent and unpolished but at the very least! At the very least I was going to try!");
    			t14 = space();
    			div11 = element("div");
    			div10 = element("div");
    			t15 = text("Into the spring, I self-published a comic compilation to express and get out some feelings I had going through major life changes. Speaking things into existence only makes them more \n      \n        ");
    			create_component(highlight4.$$.fragment);
    			t16 = text("\n        , but it was what I needed to see clearly. It was how I could move forward.");
    			t17 = space();
    			div13 = element("div");
    			div12 = element("div");
    			t18 = text("Spring was also a chance to share said work with the world, I started posting more on social media and put my comics and zines up at some consignment stores. I didn't expect for a few friends and random people to reach out to me to tell me how much the work resonated with them. How \n        ");
    			create_component(highlight5.$$.fragment);
    			t19 = text("\n        it is to be seen for myself as I was!");
    			t20 = space();
    			div15 = element("div");
    			div14 = element("div");
    			t21 = text("Later on, I also got the chance to teach my first workshop at camp, at the end we all made mini 4-8 panel comics and did a small show and tell which was so incredibly heartwarming. I also did an array of experiments for camp under a general theme of \n        ");
    			create_component(highlight6.$$.fragment);
    			t22 = text("\n        (or more aptly different manifestations of my own yearning).");
    			t23 = space();
    			div17 = element("div");
    			div16 = element("div");
    			t24 = text("I started writing as a way to understand the world, not just myself. I'd \n        ");
    			create_component(highlight7.$$.fragment);
    			t25 = text("\n        articles, quotes, and things from my every day life over a few months in my messenger app, until enough bubbled up into a coherent stream of thoughts. A looser kind of research that was a slow accumulation over time, which felt like a new way of seeing.");
    			t26 = space();
    			div19 = element("div");
    			div18 = element("div");
    			t27 = text("I rounded off the year with several more ambitious software projects simmering in my brain, to only \n        ");
    			create_component(highlight8.$$.fragment);
    			t28 = text("\n        with other random life events (moving, getting sick, work) which left only scattered time to dedicate to them and some major skill issues where I didn't know how exactly to develop them or start.");
    			t29 = space();
    			div21 = element("div");
    			div20 = element("div");
    			t30 = text("As part of practice, I also want to live \n        ");
    			create_component(highlight9.$$.fragment);
    			t31 = text("\n        Instead of spending so much time trying to predict the future and analyze what the \"right thing\" to do, I want to let go of expectation and be guided from what stirs within me.");
    			t32 = space();
    			div23 = element("div");
    			div22 = element("div");
    			t33 = text("The past year I felt like I had lived in a way that was markedly different from how I spent the four before that. At the end of this year I read \n        \n        ");
    			create_component(highlight10.$$.fragment);
    			t34 = text("\n         and felt a deja vu for a fair share of the book. I had not done that much, but I had done something at the very least, I moved forward.");
    			t35 = space();
    			div25 = element("div");
    			div24 = element("div");
    			t36 = text("When I first graduated I didn't really know what I wanted to do. The most I could articulate was a vague desire to maybe illustrate some things and sell it at an art fair. I sold at a few this year with the help of friends who had \n        ");
    			create_component(highlight11.$$.fragment);
    			t37 = text("\n         on their table, and even \n         ");
    			create_component(highlight12.$$.fragment);
    			t38 = text("\n          with friends at the very end of the year! I can understand it more clearly, it wasn't the act of selling at a fair really, it was being able to connect with others over creativity as a way to interact with the world. And it didn't have to be at a fair even, just passing conversations on the train, at a chance encounter, on the interwebs, anywhere and anytime at all was more than enough for me. I'm so grateful to everyone I've met, and have yet to meet!");
    			t39 = space();
    			div27 = element("div");
    			div26 = element("div");
    			p1 = element("p");
    			t40 = text("Thanks for reading! You can read more of my writing ");
    			a = element("a");
    			a.textContent = "here";
    			t42 = text("!");
    			attr_dev(div0, "class", "column-content svelte-1f169f6");
    			add_location(div0, file, 87, 4, 2067);
    			attr_dev(div1, "class", "column svelte-1f169f6");
    			add_location(div1, file, 86, 2, 2042);
    			set_style(p0, "color", "gray");
    			add_location(p0, file, 91, 6, 2147);
    			attr_dev(div2, "class", "column-content svelte-1f169f6");
    			add_location(div2, file, 92, 6, 2241);
    			attr_dev(div3, "class", "column svelte-1f169f6");
    			add_location(div3, file, 90, 4, 2120);
    			attr_dev(div4, "class", "column-content svelte-1f169f6");
    			add_location(div4, file, 108, 6, 2961);
    			attr_dev(div5, "class", "column svelte-1f169f6");
    			add_location(div5, file, 107, 4, 2934);
    			attr_dev(div6, "class", "column-content svelte-1f169f6");
    			add_location(div6, file, 120, 6, 3438);
    			attr_dev(div7, "class", "column svelte-1f169f6");
    			add_location(div7, file, 119, 4, 3411);
    			attr_dev(div8, "class", "column-content svelte-1f169f6");
    			add_location(div8, file, 133, 6, 4048);
    			attr_dev(div9, "class", "column svelte-1f169f6");
    			add_location(div9, file, 132, 4, 4021);
    			attr_dev(div10, "class", "column-content svelte-1f169f6");
    			add_location(div10, file, 151, 6, 5288);
    			attr_dev(div11, "class", "column svelte-1f169f6");
    			add_location(div11, file, 150, 4, 5261);
    			attr_dev(div12, "class", "column-content svelte-1f169f6");
    			add_location(div12, file, 164, 6, 5829);
    			attr_dev(div13, "class", "column svelte-1f169f6");
    			add_location(div13, file, 163, 4, 5802);
    			attr_dev(div14, "class", "column-content svelte-1f169f6");
    			add_location(div14, file, 176, 6, 6420);
    			attr_dev(div15, "class", "column svelte-1f169f6");
    			add_location(div15, file, 175, 4, 6393);
    			attr_dev(div16, "class", "column-content svelte-1f169f6");
    			add_location(div16, file, 188, 6, 7256);
    			attr_dev(div17, "class", "column svelte-1f169f6");
    			add_location(div17, file, 187, 4, 7229);
    			attr_dev(div18, "class", "column-content svelte-1f169f6");
    			add_location(div18, file, 200, 6, 7944);
    			attr_dev(div19, "class", "column svelte-1f169f6");
    			add_location(div19, file, 199, 4, 7917);
    			attr_dev(div20, "class", "column-content svelte-1f169f6");
    			add_location(div20, file, 211, 6, 8455);
    			attr_dev(div21, "class", "column svelte-1f169f6");
    			add_location(div21, file, 210, 4, 8428);
    			attr_dev(div22, "class", "column-content svelte-1f169f6");
    			add_location(div22, file, 222, 6, 8885);
    			attr_dev(div23, "class", "column svelte-1f169f6");
    			add_location(div23, file, 221, 4, 8858);
    			attr_dev(div24, "class", "column-content svelte-1f169f6");
    			add_location(div24, file, 234, 6, 9405);
    			attr_dev(div25, "class", "column svelte-1f169f6");
    			add_location(div25, file, 233, 4, 9378);
    			attr_dev(a, "href", "https://corny.substack.com");
    			add_location(a, file, 256, 62, 10624);
    			add_location(p1, file, 255, 8, 10558);
    			attr_dev(div26, "class", "column-content svelte-1f169f6");
    			add_location(div26, file, 254, 6, 10521);
    			attr_dev(div27, "class", "column svelte-1f169f6");
    			add_location(div27, file, 253, 4, 10494);
    			attr_dev(div28, "class", "content-container svelte-1f169f6");
    			add_location(div28, file, 82, 2, 1970);
    			attr_dev(div29, "class", "scroll-container svelte-1f169f6");
    			add_location(div29, file, 80, 0, 1896);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div29, anchor);
    			append_dev(div29, div28);
    			append_dev(div28, div1);
    			append_dev(div1, div0);
    			append_dev(div28, t0);
    			append_dev(div28, div3);
    			append_dev(div3, p0);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, t3);
    			mount_component(highlight0, div2, null);
    			append_dev(div2, t4);
    			append_dev(div28, t5);
    			append_dev(div28, div5);
    			append_dev(div5, div4);
    			append_dev(div4, t6);
    			mount_component(highlight1, div4, null);
    			append_dev(div4, t7);
    			append_dev(div28, t8);
    			append_dev(div28, div7);
    			append_dev(div7, div6);
    			append_dev(div6, t9);
    			mount_component(highlight2, div6, null);
    			append_dev(div6, t10);
    			append_dev(div28, t11);
    			append_dev(div28, div9);
    			append_dev(div9, div8);
    			append_dev(div8, t12);
    			mount_component(highlight3, div8, null);
    			append_dev(div8, t13);
    			append_dev(div28, t14);
    			append_dev(div28, div11);
    			append_dev(div11, div10);
    			append_dev(div10, t15);
    			mount_component(highlight4, div10, null);
    			append_dev(div10, t16);
    			append_dev(div28, t17);
    			append_dev(div28, div13);
    			append_dev(div13, div12);
    			append_dev(div12, t18);
    			mount_component(highlight5, div12, null);
    			append_dev(div12, t19);
    			append_dev(div28, t20);
    			append_dev(div28, div15);
    			append_dev(div15, div14);
    			append_dev(div14, t21);
    			mount_component(highlight6, div14, null);
    			append_dev(div14, t22);
    			append_dev(div28, t23);
    			append_dev(div28, div17);
    			append_dev(div17, div16);
    			append_dev(div16, t24);
    			mount_component(highlight7, div16, null);
    			append_dev(div16, t25);
    			append_dev(div28, t26);
    			append_dev(div28, div19);
    			append_dev(div19, div18);
    			append_dev(div18, t27);
    			mount_component(highlight8, div18, null);
    			append_dev(div18, t28);
    			append_dev(div28, t29);
    			append_dev(div28, div21);
    			append_dev(div21, div20);
    			append_dev(div20, t30);
    			mount_component(highlight9, div20, null);
    			append_dev(div20, t31);
    			append_dev(div28, t32);
    			append_dev(div28, div23);
    			append_dev(div23, div22);
    			append_dev(div22, t33);
    			mount_component(highlight10, div22, null);
    			append_dev(div22, t34);
    			append_dev(div28, t35);
    			append_dev(div28, div25);
    			append_dev(div25, div24);
    			append_dev(div24, t36);
    			mount_component(highlight11, div24, null);
    			append_dev(div24, t37);
    			mount_component(highlight12, div24, null);
    			append_dev(div24, t38);
    			append_dev(div28, t39);
    			append_dev(div28, div27);
    			append_dev(div27, div26);
    			append_dev(div26, p1);
    			append_dev(p1, t40);
    			append_dev(p1, a);
    			append_dev(p1, t42);
    			/*div28_binding*/ ctx[1](div28);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(highlight0.$$.fragment, local);
    			transition_in(highlight1.$$.fragment, local);
    			transition_in(highlight2.$$.fragment, local);
    			transition_in(highlight3.$$.fragment, local);
    			transition_in(highlight4.$$.fragment, local);
    			transition_in(highlight5.$$.fragment, local);
    			transition_in(highlight6.$$.fragment, local);
    			transition_in(highlight7.$$.fragment, local);
    			transition_in(highlight8.$$.fragment, local);
    			transition_in(highlight9.$$.fragment, local);
    			transition_in(highlight10.$$.fragment, local);
    			transition_in(highlight11.$$.fragment, local);
    			transition_in(highlight12.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(highlight0.$$.fragment, local);
    			transition_out(highlight1.$$.fragment, local);
    			transition_out(highlight2.$$.fragment, local);
    			transition_out(highlight3.$$.fragment, local);
    			transition_out(highlight4.$$.fragment, local);
    			transition_out(highlight5.$$.fragment, local);
    			transition_out(highlight6.$$.fragment, local);
    			transition_out(highlight7.$$.fragment, local);
    			transition_out(highlight8.$$.fragment, local);
    			transition_out(highlight9.$$.fragment, local);
    			transition_out(highlight10.$$.fragment, local);
    			transition_out(highlight11.$$.fragment, local);
    			transition_out(highlight12.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div29);
    			destroy_component(highlight0);
    			destroy_component(highlight1);
    			destroy_component(highlight2);
    			destroy_component(highlight3);
    			destroy_component(highlight4);
    			destroy_component(highlight5);
    			destroy_component(highlight6);
    			destroy_component(highlight7);
    			destroy_component(highlight8);
    			destroy_component(highlight9);
    			destroy_component(highlight10);
    			destroy_component(highlight11);
    			destroy_component(highlight12);
    			/*div28_binding*/ ctx[1](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const imageUrl = "https://cdn.prod.website-files.com/63531edd0af27d6d2cbf16b1/639a61119783921581253241_design-challenges.webp"; // Replace with your image URL

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let containerRef;

    	onMount(() => {
    		const handleScroll = () => {
    			if (!containerRef) return;

    			console.log('Scrolling', {
    				scrollY: window.scrollY,
    				scrollHeight: document.documentElement.scrollHeight,
    				windowHeight: window.innerHeight,
    				containerWidth: containerRef.scrollWidth,
    				windowWidth: window.innerWidth
    			});

    			const scrollPercentage = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    			const maxTranslate = containerRef.scrollWidth - window.innerWidth;
    			$$invalidate(0, containerRef.style.transform = `translateX(-${scrollPercentage * maxTranslate}px)`, containerRef);
    		};

    		window.addEventListener('scroll', handleScroll);
    		return () => window.removeEventListener('scroll', handleScroll);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function div28_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			containerRef = $$value;
    			$$invalidate(0, containerRef);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Highlight,
    		onMount,
    		imageUrl,
    		containerRef
    	});

    	$$self.$inject_state = $$props => {
    		if ('containerRef' in $$props) $$invalidate(0, containerRef = $$props.containerRef);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [containerRef, div28_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
