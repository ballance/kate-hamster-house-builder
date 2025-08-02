document.addEventListener('DOMContentLoaded', function() {
    console.log('Hamster Tiny House Builder loaded!');
    
    // Initialize the application
    const HamsterHouseBuilder = {
        // State management
        state: {
            layers: {
                'base': 'grass',
                'flooring': 'wood',
                'interior-walls': 'natural-wood',
                'exterior-walls': 'log-cabin'
            },
            furnishings: {
                'bedroom': [],
                'eating': [],
                'outside': []
            },
            hamsterMessages: [
                "This looks perfect for napping! 💤",
                "I love what you've done with the place! 🏠",
                "Can we add more treats? 🥜",
                "This tunnel system is amazing! 🕳️",
                "I need my exercise wheel! 🎡",
                "The flooring feels so cozy! 🐾",
                "Perfect spot for storing my seeds! 🌱",
                "I can't wait to explore every corner! 🔍"
            ],
            draggedItem: null,
            placementGrid: null
        },
        
        // Initialize all components
        init() {
            this.setupLayerControls();
            this.setupFurnishingControls();
            this.setupHamsterCharacter();
            this.setupActionButtons();
            this.setupDragAndDrop();
            this.createSparkleEffect();
            this.initializeDefaults();
        },
        
        // Setup layer control functionality (radio buttons)
        setupLayerControls() {
            const layerSections = document.querySelectorAll('.layer-section');
            
            layerSections.forEach(section => {
                const layerType = section.getAttribute('data-layer');
                if (!layerType) return;
                
                const radioButtons = section.querySelectorAll('input[type="radio"]');
                radioButtons.forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        if (e.target.checked) {
                            this.updateLayer(layerType, e.target.value);
                            this.createLayerChangeEffect(layerType);
                            this.hamsterReact("I love this new look!");
                        }
                    });
                });
            });
        },
        
        // Setup furnishing control functionality (checkboxes)
        setupFurnishingControls() {
            const furnishingSections = document.querySelectorAll('.layer-section[data-layer="bedroom"], .layer-section[data-layer="eating"], .layer-section[data-layer="outside"]');
            
            furnishingSections.forEach(section => {
                const furnishingType = section.getAttribute('data-layer');
                const checkboxes = section.querySelectorAll('input[type="checkbox"]');
                
                checkboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', (e) => {
                        if (e.target.checked) {
                            this.addFurnishing(furnishingType, e.target.value);
                            this.hamsterReact(this.getFurnishingMessage(e.target.value));
                        } else {
                            this.removeFurnishing(furnishingType, e.target.value);
                            this.hamsterReact("Hmm, I'll miss that one...");
                        }
                    });
                });
            });
        },
        
        // Setup interactive hamster character
        setupHamsterCharacter() {
            const hamster = document.getElementById('hamster-character');
            let messageTimeout;
            
            hamster.addEventListener('click', () => {
                this.hamsterReact();
                this.createSparkleEffect(hamster);
            });
            
            // Random hamster movements
            setInterval(() => {
                this.moveHamsterRandomly();
            }, 8000);
            
            // Periodic hamster messages
            setInterval(() => {
                if (Math.random() < 0.3) { // 30% chance
                    this.hamsterReact();
                }
            }, 15000);
        },
        
        // Setup save and share button functionality
        setupActionButtons() {
            const saveButton = document.querySelector('.save-design');
            const shareButton = document.querySelector('.share-design');
            
            saveButton.addEventListener('click', () => {
                this.saveDesign();
            });
            
            shareButton.addEventListener('click', () => {
                this.shareDesign();
            });
        },
        
        // Setup drag and drop functionality
        setupDragAndDrop() {
            const housePreview = document.querySelector('.house-preview');
            const placementGrid = document.getElementById('placement-grid');
            this.state.placementGrid = placementGrid;
            
            // Enable drag and drop for furnishing items
            document.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('furnishing-item')) {
                    this.startDragging(e.target, e);
                }
            });
            
            document.addEventListener('mousemove', (e) => {
                if (this.state.draggedItem) {
                    this.dragItem(e);
                }
            });
            
            document.addEventListener('mouseup', (e) => {
                if (this.state.draggedItem) {
                    this.stopDragging(e);
                }
            });
        },
        
        // Update visual layer based on selection
        updateLayer(layerType, value) {
            const layer = document.getElementById(`${layerType}-layer`);
            if (!layer) {
                console.error(`Layer element not found: ${layerType}-layer`);
                return;
            }
            
            console.log(`Updating ${layerType} from`, layer.className, `to ${value}`);
            
            // Remove all existing material classes (keep 'layer' and layer type)
            const materialClasses = ['grass', 'dirt', 'sand', 'stone', 'wood', 'bamboo', 'paper', 'fleece', 
                                   'natural-wood', 'painted-white', 'painted-blue', 'cardboard',
                                   'log-cabin', 'brick', 'siding'];
            materialClasses.forEach(cls => layer.classList.remove(cls));
            
            // Add new class
            layer.classList.add(value);
            
            // Special handling for walls - update individual wall elements
            if (layerType === 'exterior-walls') {
                const walls = layer.querySelectorAll('.wall-front, .wall-right, .wall-left, .wall-back');
                walls.forEach(wall => {
                    materialClasses.forEach(cls => wall.classList.remove(cls));
                    wall.classList.add(value);
                });
            }
            
            if (layerType === 'interior-walls') {
                const interiorWalls = layer.querySelectorAll('.interior-wall-front, .interior-wall-left, .interior-wall-right, .interior-wall-back');
                interiorWalls.forEach(wall => {
                    materialClasses.forEach(cls => wall.classList.remove(cls));
                    wall.classList.add(value);
                });
            }
            
            // Update state
            this.state.layers[layerType] = value;
            
            console.log(`Updated ${layerType} to ${value}`, 'New classes:', layer.className);
        },
        
        // Add furnishing item to the house
        addFurnishing(category, itemType) {
            if (!this.state.furnishings[category].includes(itemType)) {
                this.state.furnishings[category].push(itemType);
                this.createFurnishingElement(category, itemType);
            }
        },
        
        // Remove furnishing item from the house
        removeFurnishing(category, itemType) {
            const index = this.state.furnishings[category].indexOf(itemType);
            if (index > -1) {
                this.state.furnishings[category].splice(index, 1);
                this.removeFurnishingElement(itemType);
            }
        },
        
        // Create visual furnishing element
        createFurnishingElement(category, itemType) {
            const furnishingsLayer = document.getElementById('furnishings-layer');
            const item = document.createElement('div');
            
            item.className = `furnishing-item ${itemType}`;
            item.setAttribute('data-type', itemType);
            item.setAttribute('data-category', category);
            
            // Position randomly within the house bounds
            const position = this.getRandomPosition();
            item.style.left = position.x + 'px';
            item.style.top = position.y + 'px';
            
            furnishingsLayer.appendChild(item);
            
            // Add entrance animation
            item.style.transform = 'scale(0)';
            item.style.opacity = '0';
            
            setTimeout(() => {
                item.style.transform = 'scale(1)';
                item.style.opacity = '1';
                item.style.transition = 'all 0.3s ease';
            }, 100);
            
            this.createSparkleEffect(item);
        },
        
        // Remove visual furnishing element
        removeFurnishingElement(itemType) {
            const item = document.querySelector(`.furnishing-item[data-type="${itemType}"]`);
            if (item) {
                item.style.transform = 'scale(0)';
                item.style.opacity = '0';
                setTimeout(() => {
                    item.remove();
                }, 300);
            }
        },
        
        // Get random position within house bounds
        getRandomPosition() {
            const houseContainer = document.querySelector('.house-container');
            const rect = houseContainer.getBoundingClientRect();
            
            return {
                x: Math.random() * (rect.width - 40) + 20,
                y: Math.random() * (rect.height - 40) + 20
            };
        },
        
        // Hamster reaction system
        hamsterReact(customMessage = null) {
            const hamster = document.getElementById('hamster-character');
            const existingMessage = hamster.querySelector('.hamster-message');
            
            // Remove existing message
            if (existingMessage) {
                existingMessage.remove();
            }
            
            // Create new message
            const message = document.createElement('div');
            message.className = 'hamster-message';
            message.textContent = customMessage || this.getRandomHamsterMessage();
            
            hamster.appendChild(message);
            
            // Hamster bounce animation
            hamster.style.animation = 'bounce 1s ease-in-out';
            
            // Remove message after delay
            setTimeout(() => {
                message.classList.add('fade-out');
                setTimeout(() => {
                    message.remove();
                }, 300);
            }, 3000);
            
            // Reset hamster animation
            setTimeout(() => {
                hamster.style.animation = '';
            }, 1000);
        },
        
        // Get random hamster message
        getRandomHamsterMessage() {
            return this.state.hamsterMessages[Math.floor(Math.random() * this.state.hamsterMessages.length)];
        },
        
        // Get specific message for furnishing type
        getFurnishingMessage(itemType) {
            const messages = {
                'hideout': 'Perfect for my secret hideout! 🏠',
                'soft-bed': 'So cozy for sleeping! 😴',
                'tunnel': 'I love exploring tunnels! 🕳️',
                'hammock': 'Time for a relaxing swing! 🌙',
                'food-bowl': 'Yummy treats await! 🥜',
                'water-bottle': 'Fresh water, perfect! 💧',
                'treat-dispenser': 'More treats? Yes please! 🍪',
                'hay-rack': 'Great for snacking! 🌾',
                'litter-box': 'Essential for staying clean! 🧹',
                'exercise-wheel': 'Time to get my cardio in! 🏃‍♂️',
                'climbing-structure': 'I can reach new heights! 🧗‍♂️',
                'digging-pit': 'Perfect for my digging adventures! ⛏️'
            };
            return messages[itemType] || 'I love this addition!';
        },
        
        // Move hamster randomly around the house
        moveHamsterRandomly() {
            const hamster = document.getElementById('hamster-character');
            const housePreview = document.querySelector('.house-preview');
            const rect = housePreview.getBoundingClientRect();
            
            const newX = Math.random() * (rect.width - 80) + 40;
            const newY = Math.random() * 100 + 20; // Keep hamster in upper area
            
            hamster.style.transition = 'all 2s ease-in-out';
            hamster.style.left = newX + 'px';
            hamster.style.top = newY + 'px';
            
            // Reset transition after movement
            setTimeout(() => {
                hamster.style.transition = '';
            }, 2000);
        },
        
        // Create sparkle effect
        createSparkleEffect(target = null) {
            const container = target || document.querySelector('.house-preview');
            const rect = container.getBoundingClientRect();
            
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const sparkle = document.createElement('div');
                    sparkle.className = 'sparkle';
                    
                    const x = Math.random() * rect.width;
                    const y = Math.random() * rect.height;
                    
                    sparkle.style.left = x + 'px';
                    sparkle.style.top = y + 'px';
                    
                    container.appendChild(sparkle);
                    
                    // Remove sparkle after animation
                    setTimeout(() => {
                        sparkle.remove();
                    }, 2000);
                }, i * 200);
            }
        },
        
        // Create layer change effect
        createLayerChangeEffect(layerType) {
            const layer = document.getElementById(`${layerType}-layer`);
            if (!layer) return;
            
            layer.style.transform = 'scale(1.05)';
            layer.style.transition = 'transform 0.3s ease';
            
            setTimeout(() => {
                layer.style.transform = '';
            }, 300);
            
            this.createSparkleEffect(layer);
        },
        
        // Drag and drop functionality
        startDragging(item, event) {
            this.state.draggedItem = item;
            this.state.placementGrid.classList.add('active');
            
            item.classList.add('dragging');
            
            // Calculate offset
            const rect = item.getBoundingClientRect();
            const houseRect = document.querySelector('.house-container').getBoundingClientRect();
            
            this.state.dragOffset = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                houseX: houseRect.left,
                houseY: houseRect.top
            };
            
            event.preventDefault();
        },
        
        dragItem(event) {
            if (!this.state.draggedItem) return;
            
            const houseContainer = document.querySelector('.house-container');
            const houseRect = houseContainer.getBoundingClientRect();
            
            let x = event.clientX - this.state.dragOffset.houseX - this.state.dragOffset.x;
            let y = event.clientY - this.state.dragOffset.houseY - this.state.dragOffset.y;
            
            // Constrain to house bounds
            x = Math.max(0, Math.min(x, houseRect.width - 30));
            y = Math.max(0, Math.min(y, houseRect.height - 30));
            
            // Snap to grid
            x = Math.round(x / 20) * 20;
            y = Math.round(y / 20) * 20;
            
            this.state.draggedItem.style.left = x + 'px';
            this.state.draggedItem.style.top = y + 'px';
        },
        
        stopDragging(event) {
            if (!this.state.draggedItem) return;
            
            this.state.draggedItem.classList.remove('dragging');
            this.state.placementGrid.classList.remove('active');
            
            // Create sparkle effect at drop location
            this.createSparkleEffect(this.state.draggedItem);
            
            this.state.draggedItem = null;
            this.state.dragOffset = null;
            
            this.hamsterReact("Nice placement! 👍");
        },
        
        // Save design functionality
        saveDesign() {
            const design = {
                timestamp: new Date().toISOString(),
                layers: { ...this.state.layers },
                furnishings: { ...this.state.furnishings },
                furnishingPositions: this.getFurnishingPositions()
            };
            
            // Save to localStorage
            const savedDesigns = JSON.parse(localStorage.getItem('hamsterHouseDesigns') || '[]');
            savedDesigns.push(design);
            localStorage.setItem('hamsterHouseDesigns', JSON.stringify(savedDesigns));
            
            // Visual feedback
            const saveButton = document.querySelector('.save-design');
            const originalText = saveButton.textContent;
            
            saveButton.textContent = '✅ Saved!';
            saveButton.style.background = 'linear-gradient(145deg, #28a745, #218838)';
            
            setTimeout(() => {
                saveButton.textContent = originalText;
                saveButton.style.background = '';
            }, 2000);
            
            this.hamsterReact("Design saved! I won't forget this house! 💾");
            this.createSparkleEffect();
        },
        
        // Share design functionality
        shareDesign() {
            const design = {
                layers: { ...this.state.layers },
                furnishings: { ...this.state.furnishings }
            };
            
            const designCode = btoa(JSON.stringify(design));
            const shareUrl = `${window.location.origin}${window.location.pathname}?design=${designCode}`;
            
            // Copy to clipboard
            navigator.clipboard.writeText(shareUrl).then(() => {
                const shareButton = document.querySelector('.share-design');
                const originalText = shareButton.textContent;
                
                shareButton.textContent = '📋 Copied!';
                shareButton.style.background = 'linear-gradient(145deg, #17a2b8, #138496)';
                
                setTimeout(() => {
                    shareButton.textContent = originalText;
                    shareButton.style.background = '';
                }, 2000);
                
                this.hamsterReact("Design shared! Others can see our amazing house! 📤");
            }).catch(() => {
                // Fallback for browsers without clipboard API
                prompt('Copy this URL to share your design:', shareUrl);
            });
            
            this.createSparkleEffect();
        },
        
        // Get current furnishing positions
        getFurnishingPositions() {
            const positions = {};
            const items = document.querySelectorAll('.furnishing-item');
            
            items.forEach(item => {
                const type = item.getAttribute('data-type');
                positions[type] = {
                    x: item.style.left,
                    y: item.style.top
                };
            });
            
            return positions;
        },
        
        // Load design from URL parameter
        loadSharedDesign() {
            const urlParams = new URLSearchParams(window.location.search);
            const designCode = urlParams.get('design');
            
            if (designCode) {
                try {
                    const design = JSON.parse(atob(designCode));
                    this.applyDesign(design);
                    this.hamsterReact("Welcome to our shared house design! 🏠✨");
                } catch (error) {
                    console.error('Failed to load shared design:', error);
                }
            }
        },
        
        // Apply a design configuration
        applyDesign(design) {
            // Apply layers
            Object.entries(design.layers).forEach(([layerType, value]) => {
                const radio = document.querySelector(`input[name="${layerType}"][value="${value}"]`);
                if (radio) {
                    radio.checked = true;
                    this.updateLayer(layerType, value);
                }
            });
            
            // Apply furnishings
            Object.entries(design.furnishings).forEach(([category, items]) => {
                items.forEach(itemType => {
                    const checkbox = document.querySelector(`input[name="${category}"][value="${itemType}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        this.addFurnishing(category, itemType);
                    }
                });
            });
        },
        
        // Initialize default state
        initializeDefaults() {
            // Load shared design if available
            this.loadSharedDesign();
            
            // Initialize with default checked items
            const checkedRadios = document.querySelectorAll('input[type="radio"]:checked');
            checkedRadios.forEach(radio => {
                const section = radio.closest('.layer-section');
                const layerType = section.getAttribute('data-layer');
                if (layerType) {
                    this.updateLayer(layerType, radio.value);
                }
            });
            
            // Welcome message
            setTimeout(() => {
                this.hamsterReact("Welcome to my house builder! Let's create something amazing! 🎉");
            }, 1000);
        }
    };
    
    // Initialize the application
    HamsterHouseBuilder.init();
    
    // Expose to global scope for debugging
    window.HamsterHouseBuilder = HamsterHouseBuilder;
});