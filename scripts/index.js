(function() {
    'use strict'

    const CONFIG = {
        headerSelector: 'h2',
        navLinkSelector: '.nav-link, nav a[href^="#"]',
        excludeLinks: ['../index.html', '/index.html', 'index.html'],
        highlightDuration: 2000,
        scrollOffset: 20,
        buttonHTML: '<a href="#" class="back-to-top" title="Наверх">↑</a>'
    }

    let headers = []
    let navLinks = []
    let backToTopButtons = []
    let highlightTimer = null

    document.addEventListener('DOMContentLoaded', init)

    function init() {
        headers = Array.from(document.querySelectorAll(CONFIG.headerSelector))
        addBackToTopButtons()
        navLinks = findNavLinks()
        backToTopButtons = Array.from(document.querySelectorAll('.back-to-top'))
        if (headers.length > 0) {
            setupEventListeners()
            handleInitialHash()
            setTimeout(() => {
                updateBackToTopButtons()
                updateActiveNavLink()
            }, 200)
        }
    }

    function findNavLinks() {
        const links = Array.from(document.querySelectorAll(CONFIG.navLinkSelector))
        return links.filter(link => {
            const href = link.getAttribute('href') || ''
            if (!href || href === '#') return false
            const isHashLink = href.startsWith('#')
            const isExcluded = CONFIG.excludeLinks.some(exclude => 
                href === exclude || href.endsWith(exclude)
            )
            return isHashLink && !isExcluded
        })
    }

    function addBackToTopButtons() {
        headers.forEach(header => {
            if (header.querySelector('.back-to-top')) return
            if (!header.id) {
                const id = header.textContent
                    .toLowerCase()
                    .replace(/[^a-zа-я0-9]+/g, '-')
                    .replace(/^-|-$/g, '')
                header.id = id
            }
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = CONFIG.buttonHTML
            const button = tempDiv.firstChild
            header.appendChild(button)
        })
    }

    function setupEventListeners() {
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavClick)
        })

        backToTopButtons.forEach(button => {
            button.addEventListener('click', handleBackToTopClick)
        })

        window.addEventListener('scroll', throttle(handleScroll, 100))

        window.addEventListener('resize', throttle(() => {
            updateBackToTopButtons()
            updateActiveNavLink()
        }, 100))
    }
    
    function handleNavClick(e) {
        e.preventDefault()
        const link = e.currentTarget
        const href = link.getAttribute('href')
        const targetId = href.substring(1)
        const targetElement = document.getElementById(targetId)
        
        if (targetElement) {
            navLinks.forEach(l => l.classList.remove('active'))
            link.classList.add('active')
            targetElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            })
            highlightElement(targetElement)
            history.pushState(null, null, href)
        }
    }
    function handleBackToTopClick(e) {
        e.preventDefault()
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
        navLinks.forEach(l => l.classList.remove('active'))
        history.pushState(null, null, window.location.pathname)
    }

    function handleInitialHash() {
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1)
            const targetElement = document.getElementById(targetId)
            
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    })
                    
                    highlightElement(targetElement)

                    const activeLink = document.querySelector(`${CONFIG.navLinkSelector}[href="#${targetId}"]`)
                    if (activeLink) {
                        navLinks.forEach(l => l.classList.remove('active'))
                        activeLink.classList.add('active')
                    }
                }, 100)
            }
        }
    }

    function handleScroll() {
        updateBackToTopButtons()
        updateActiveNavLink()
    }

    function updateBackToTopButtons() {
        const scrollPosition = window.scrollY
        
        headers.forEach(header => {
            const button = header.querySelector('.back-to-top')
            if (button) {
                const headerTop = header.offsetTop

                if (scrollPosition > headerTop - 150) {
                    button.classList.add('visible')
                } else {
                    button.classList.remove('visible')
                }
            }
        })
    }

    function updateActiveNavLink() {
        const scrollPosition = window.scrollY

        let currentHeader = null
        
        for (let i = headers.length - 1; i >= 0; i--) {
            const header = headers[i]
            const headerTop = header.offsetTop
            
            if (scrollPosition >= headerTop - 150) {
                currentHeader = header
                break
            }
        }

        navLinks.forEach(link => {
            link.classList.remove('active')
            
            if (currentHeader) {
                const linkTarget = link.getAttribute('href').substring(1)
                if (linkTarget === currentHeader.id) {
                    link.classList.add('active')
                }
            }
        })
    }

    function highlightElement(element) {
        headers.forEach(header => {
            header.classList.remove('highlight')
        })

        element.classList.add('highlight')

        if (highlightTimer) {
            clearTimeout(highlightTimer)
        }
        
        highlightTimer = setTimeout(() => {
            element.classList.remove('highlight')
            highlightTimer = null
        }, CONFIG.highlightDuration)
    }

    function throttle(func, limit) {
        let inThrottle
        return function() {
            const args = arguments
            const context = this
            if (!inThrottle) {
                func.apply(context, args)
                inThrottle = true
                setTimeout(() => inThrottle = false, limit)
            }
        }
    }
})()