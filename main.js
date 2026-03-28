/**
 * AutoEstética — main.js
 * Luxury Auto Detailing — Interações e comportamentos de UI
 */

"use strict";

/* ════════════════════════════════════════
   UTILITÁRIOS
════════════════════════════════════════ */
/**
 * Aguarda o DOM estar pronto antes de executar callback.
 * Mais robusto que DOMContentLoaded inline.
 */
function domReady(fn) {
	if (document.readyState !== "loading") {
		fn();
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}

/* ════════════════════════════════════════
   NAVBAR — efeito de scroll
════════════════════════════════════════ */
function initNavbar() {
	const navbar = document.getElementById("navbar");
	if (!navbar) return;

	const onScroll = () => {
		navbar.classList.toggle("scrolled", window.scrollY > 60);
	};

	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll(); // aplica estado inicial caso a página seja recarregada com scroll
}

/* ════════════════════════════════════════
   HERO VIDEO — zoom suave na entrada
════════════════════════════════════════ */
function initHeroVideo() {
	const heroSection = document.getElementById("hero");
	if (!heroSection) return;

	window.addEventListener("load", () => {
		setTimeout(() => heroSection.classList.add("loaded"), 100);
	});
}

/* ════════════════════════════════════════
   MENU MOBILE
════════════════════════════════════════ */
function initMobileMenu() {
	const menu = document.getElementById("mobileMenu");
	const btn = document.getElementById("hamburger");
	if (!menu || !btn) return;

	// Fechar ao clicar em links internos
	menu.querySelectorAll("a").forEach((a) => {
		a.addEventListener("click", () => {
			if (menu.classList.contains("open")) toggleMenu();
		});
	});

	// Fechar com ESC
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && menu.classList.contains("open")) toggleMenu();
	});
}

/** Exposta globalmente para chamadas inline onclick="toggleMenu()" */
function toggleMenu() {
	const menu = document.getElementById("mobileMenu");
	const btn = document.getElementById("hamburger");
	if (!menu || !btn) return;

	const isOpen = menu.classList.toggle("open");

	menu.style.opacity = isOpen ? "1" : "0";
	menu.style.pointerEvents = isOpen ? "all" : "none";
	menu.setAttribute("aria-hidden", String(!isOpen));
	btn.setAttribute("aria-expanded", String(isOpen));
	btn.classList.toggle("open", isOpen);

	const spans = btn.querySelectorAll("span");
	if (isOpen) {
		spans[0].style.transform = "translateY(7px) rotate(45deg)";
		spans[1].style.opacity = "0";
		spans[2].style.transform = "translateY(-7px) rotate(-45deg)";
	} else {
		spans[0].style.transform = "";
		spans[1].style.opacity = "";
		spans[2].style.transform = "";
	}

	document.body.style.overflow = isOpen ? "hidden" : "";
}

/* ════════════════════════════════════════
   GALERIA — tabs com filtro por categoria
════════════════════════════════════════ */
function initGallery() {
	const initialTab = document.querySelector(".gallery-tab.active");
	if (initialTab) {
		switchTab(initialTab, initialTab.dataset.tab || "pintura");
	}
}

/** Exposta globalmente para chamadas inline onclick="switchTab(...)" */
function switchTab(btn, category) {
	document.querySelectorAll(".gallery-tab").forEach((t) => {
		t.classList.remove("active");
		t.setAttribute("aria-selected", "false");
	});
	btn.classList.add("active");
	btn.setAttribute("aria-selected", "true");

	document.querySelectorAll(".gallery-item").forEach((item) => {
		if (item.dataset.category === category) {
			item.classList.remove("hidden");
			item.classList.add("visible");
			setTimeout(() => item.classList.remove("visible"), 500);
		} else {
			item.classList.add("hidden");
			item.classList.remove("visible");
		}
	});
}

/* ════════════════════════════════════════
   TESTIMONIALS — slider com autoplay
════════════════════════════════════════ */
let currentTestimonial = 0;
let sliderInterval = null;

const getVisibleCards = () =>
	window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;

function goToTestimonial(index) {
	const track = document.getElementById("testimonialTrack");
	if (!track) return;

	const cards = track.querySelectorAll(".testimonial-card");
	const visible = getVisibleCards();
	const maxIndex = cards.length - visible;

	currentTestimonial = Math.max(0, Math.min(index, maxIndex));

	// Recalcula a largura real do card (corrige bugs de resize)
	const cardWidth = cards[0].getBoundingClientRect().width + 24; // gap = 24px
	track.style.transform = `translateX(-${currentTestimonial * cardWidth}px)`;

	document.querySelectorAll(".t-dot").forEach((d, i) => {
		const active = i === currentTestimonial;
		d.classList.toggle("active", active);
		d.style.background = active ? "var(--gold)" : "";
		d.style.transform = active ? "scale(1.3)" : "";
		d.setAttribute("aria-selected", String(active));
	});
}

function startSlider() {
	stopSlider();
	sliderInterval = setInterval(() => {
		const track = document.getElementById("testimonialTrack");
		if (!track) return;
		const maxIndex =
			track.querySelectorAll(".testimonial-card").length -
			getVisibleCards();
		goToTestimonial(
			currentTestimonial >= maxIndex ? 0 : currentTestimonial + 1,
		);
	}, 5000);
}

function stopSlider() {
	if (sliderInterval) {
		clearInterval(sliderInterval);
		sliderInterval = null;
	}
}

/** Exposta globalmente para dots inline */
function handleDotClick(index) {
	goToTestimonial(index);
	startSlider();
}

function initTestimonials() {
	const wrapper = document.getElementById("testimonialWrapper");
	if (!wrapper) return;

	wrapper.addEventListener("mouseenter", stopSlider);
	wrapper.addEventListener("mouseleave", startSlider);

	// Suporte a swipe em touch
	let touchStartX = 0;
	wrapper.addEventListener(
		"touchstart",
		(e) => {
			touchStartX = e.changedTouches[0].screenX;
		},
		{ passive: true },
	);
	wrapper.addEventListener(
		"touchend",
		(e) => {
			const delta = touchStartX - e.changedTouches[0].screenX;
			if (Math.abs(delta) > 50) {
				const track = document.getElementById("testimonialTrack");
				if (!track) return;
				const maxIndex =
					track.querySelectorAll(".testimonial-card").length -
					getVisibleCards();
				if (delta > 0)
					goToTestimonial(Math.min(currentTestimonial + 1, maxIndex));
				else goToTestimonial(Math.max(currentTestimonial - 1, 0));
				startSlider();
			}
		},
		{ passive: true },
	);

	// Recalcula ao redimensionar (debounced)
	let resizeTimer;
	window.addEventListener(
		"resize",
		() => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(
				() => goToTestimonial(currentTestimonial),
				150,
			);
		},
		{ passive: true },
	);

	startSlider();
}

/* ════════════════════════════════════════
   FAQ — accordion
════════════════════════════════════════ */
function initFaq() {
	// Suporte a navegação por teclado
	document.querySelectorAll(".faq-question").forEach((btn) => {
		btn.addEventListener("keydown", (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				toggleFaq(btn);
			}
		});
	});
}

/** Exposta globalmente para chamadas inline */
function toggleFaq(btn) {
	const item = btn.closest(".faq-item");
	const answer = item.querySelector(".faq-answer");
	const icon = btn.querySelector(".faq-icon");
	const isOpen = item.classList.contains("faq-item--open");

	// Fecha todos
	document.querySelectorAll(".faq-item--open").forEach((el) => {
		el.classList.remove("faq-item--open");
		el.querySelector(".faq-answer").style.maxHeight = "0";
		el.querySelector(".faq-icon").textContent = "+";
		el.querySelector(".faq-question").setAttribute(
			"aria-expanded",
			"false",
		);
	});

	// Abre o clicado, se estava fechado
	if (!isOpen) {
		item.classList.add("faq-item--open");
		answer.style.maxHeight = answer.scrollHeight + "px";
		icon.textContent = "−";
		btn.setAttribute("aria-expanded", "true");
	}
}

/* ════════════════════════════════════════
   SCROLL TO TOP
════════════════════════════════════════ */
function initScrollTop() {
	const scrollTopBtn = document.getElementById("scrollTop");
	if (!scrollTopBtn) return;

	window.addEventListener(
		"scroll",
		() => {
			scrollTopBtn.classList.toggle("visible", window.scrollY > 600);
		},
		{ passive: true },
	);
}

/* ════════════════════════════════════════
   SCROLL SUAVE para links âncora
════════════════════════════════════════ */
function initSmoothScroll() {
	document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
		anchor.addEventListener("click", (e) => {
			const target = document.querySelector(anchor.getAttribute("href"));
			if (!target) return;
			e.preventDefault();
			const navbarHeight =
				document.getElementById("navbar")?.offsetHeight || 0;
			const top =
				target.getBoundingClientRect().top +
				window.scrollY -
				navbarHeight -
				8;
			window.scrollTo({ top, behavior: "smooth" });
		});
	});
}

/* ════════════════════════════════════════
   INTERSECTION OBSERVER — animação de entrada
════════════════════════════════════════ */
function initRevealOnScroll() {
	if (!("IntersectionObserver" in window)) return;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("revealed");
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.12 },
	);

	document
		.querySelectorAll(
			".how-step, .testimonial-card, .pricing-card, .why-item",
		)
		.forEach((el) => {
			el.classList.add("reveal-target");
			observer.observe(el);
		});
}

/* ════════════════════════════════════════
   FORMULÁRIO DE CONTATO — validação básica
════════════════════════════════════════ */
function initContactForm() {
	const form = document.querySelector(
		'form[aria-label="Formulário de contato"]',
	);
	if (!form) return;

	form.addEventListener("submit", (e) => {
		e.preventDefault();
		const name = form.querySelector("#contact-name")?.value.trim();
		const email = form.querySelector("#contact-email")?.value.trim();
		const msg = form.querySelector("#contact-message")?.value.trim();

		if (!name || !email || !msg) {
			alert("Por favor, preencha Nome, E-mail e Mensagem.");
			return;
		}
		const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRe.test(email)) {
			alert("Informe um e-mail válido.");
			return;
		}
		// Aqui você pode integrar com sua API / EmailJS / Formspree
		console.log("Formulário enviado:", { name, email, msg });
		alert("Mensagem enviada com sucesso! Entraremos em contato em breve.");
		form.reset();
	});
}

/* ════════════════════════════════════════
   INIT — ponto de entrada principal
════════════════════════════════════════ */
domReady(() => {
	initNavbar();
	initMobileMenu();
	initGallery();
	initTestimonials();
	initFaq();
	initScrollTop();
	initSmoothScroll();
	initRevealOnScroll();
	initContactForm();
});

// Hero video iniciado no load (após domReady)
initHeroVideo();
