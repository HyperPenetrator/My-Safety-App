# Location Tracking Section - Add to dashboard.html

## 1. Add to Sidebar Menu (after line 84, before Emergency Services menu item):

```html
                <a href="#location-tracking" class="menu-item" data-section="location-tracking">
                    <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="10" r="3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Location Tracking</span>
                </a>
```

## 2. Add New Section (after line 293, before Emergency Services section):

```html
            <!-- Location Tracking Section -->
            <section id="location-tracking" class="content-section">
                <div class="section-header">
                    <h1>Location Tracking</h1>
                    <p>Monitor location changes and receive safety alerts</p>
                </div>

                <div class="location-tracking-container">
                    <!-- Tracking Control Card -->
                    <div class="tracking-control-card">
                        <div class="card-header">
                            <div class="header-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke-width="2"/>
                                    <circle cx="12" cy="10" r="3" stroke-width="2"/>
                                </svg>
                            </div>
                            <div class="header-info">
                                <h3>Location Monitoring</h3>
                                <p id="locationTrackingStatus">Inactive</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="locationTrackingToggle">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="card-body">
                            <p class="info-text">Enable continuous location tracking to receive safety alerts when you travel 2km from your default location.</p>
                            <div class="tracking-features">
                                <div class="feature-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-width="2" stroke-linecap="round"/>
                                        <polyline points="22 4 12 14.01 9 11.01" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                    <span>2km distance threshold</span>
                                </div>
                                <div class="feature-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <circle cx="12" cy="12" r="10" stroke-width="2"/>
                                        <polyline points="12 6 12 12 16 14" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                    <span>30-minute notification interval</span>
                                </div>
                                <div class="feature-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke-width="2" stroke-linecap="round"/>
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                    <span>Browser notifications</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Default Location Card -->
                    <div class="default-location-card">
                        <div class="card-header">
                            <h3>Default Location</h3>
                            <button class="icon-btn" id="setCurrentAsDefaultBtn" title="Set current location as default">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M12 5v14M5 12h14" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                            </button>
                        </div>
                        <div class="card-body">
                            <p class="info-text">Set your home or usual location. You'll be notified when you travel 2km away from this location.</p>
                            
                            <div class="default-location-display hidden" id="defaultLocationDisplay">
                                <div class="location-badge">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke-width="2"/>
                                        <circle cx="12" cy="10" r="3" stroke-width="2"/>
                                    </svg>
                                    <div class="location-details">
                                        <strong id="defaultLocationName">-</strong>
                                        <small id="defaultLocationCoords">-</small>
                                    </div>
                                </div>
                                <button class="clear-btn" id="clearDefaultLocationBtn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <line x1="18" y1="6" x2="6" y2="18" stroke-width="2" stroke-linecap="round"/>
                                        <line x1="6" y1="6" x2="18" y2="18" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                    Clear
                                </button>
                            </div>

                            <div class="no-default-location" id="noDefaultLocation">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10" stroke-width="2"/>
                                    <line x1="12" y1="8" x2="12" y2="12" stroke-width="2" stroke-linecap="round"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                                <p>No default location set</p>
                                <button class="set-btn" id="setDefaultLocationBtn">Set Current Location</button>
                            </div>
                        </div>
                    </div>

                    <!-- Current Location Card -->
                    <div class="current-location-card">
                        <div class="card-header">
                            <h3>Current Location</h3>
                            <span class="live-indicator">
                                <span class="pulse"></span>
                                Live
                            </span>
                        </div>
                        <div class="card-body">
                            <div class="current-location-display hidden" id="currentLocationDisplay">
                                <div class="location-data">
                                    <div class="data-row">
                                        <span class="label">Coordinates:</span>
                                        <span class="value" id="currentLocationCoords">-</span>
                                    </div>
                                    <div class="data-row">
                                        <span class="label">Accuracy:</span>
                                        <span class="value" id="locationAccuracy">-</span>
                                    </div>
                                    <div class="data-row">
                                        <span class="label">Distance from default:</span>
                                        <span class="value" id="distanceFromDefault">-</span>
                                    </div>
                                </div>
                            </div>

                            <div class="no-location" id="noCurrentLocation">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke-width="2"/>
                                    <circle cx="12" cy="10" r="3" stroke-width="2"/>
                                </svg>
                                <p>Enable location tracking to see current location</p>
                            </div>
                        </div>
                    </div>

                    <!-- Notification Settings Card -->
                    <div class="notification-settings-card">
                        <div class="card-header">
                            <h3>Notification Settings</h3>
                        </div>
                        <div class="card-body">
                            <div class="setting-row">
                                <div class="setting-info">
                                    <h4>Distance Threshold</h4>
                                    <p>Receive alerts when you travel this distance from default location</p>
                                </div>
                                <div class="setting-value">
                                    <span class="value-display">2 km</span>
                                </div>
                            </div>
                            <div class="setting-row">
                                <div class="setting-info">
                                    <h4>Notification Interval</h4>
                                    <p>Time between repeated notifications while away from default location</p>
                                </div>
                                <div class="setting-value">
                                    <span class="value-display">30 minutes</span>
                                </div>
                            </div>
                            <div class="setting-row">
                                <div class="setting-info">
                                    <h4>Browser Notifications</h4>
                                    <p>Allow SafeTY to send browser notifications</p>
                                </div>
                                <div class="setting-value">
                                    <button class="perm-btn small" id="enableNotificationsBtn">Enable</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="info-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" stroke-width="2"/>
                        <line x1="12" y1="16" x2="12" y2="12" stroke-width="2" stroke-linecap="round"/>
                        <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <p><strong>How it works:</strong> Set your home or usual location as default. When you travel 2km or more away, you'll receive a notification every 30 minutes urging you to activate Safety Mode for your protection. Perfect for travelers and daily commuters.</p>
                </div>
            </section>
```

## 3. Add to dashboard.html before closing </body> tag (after line 687):

```html
    <!-- Location Tracking Script -->
    <script src="js/location-tracking.js"></script>
```

## 4. Update dashboard-new.js - Add event listeners (in setupEventListeners function):

```javascript
    // Location tracking toggles
    document.getElementById('locationTrackingToggle')?.addEventListener('change', (e) => {
        if (e.target.checked) {
            startLocationTracking();
        } else {
            stopLocationTracking();
        }
    });
    
    document.getElementById('setCurrentAsDefaultBtn')?.addEventListener('click', setCurrentLocationAsDefault);
    document.getElementById('setDefaultLocationBtn')?.addEventListener('click', setCurrentLocationAsDefault);
    document.getElementById('clearDefaultLocationBtn')?.addEventListener('click', clearDefaultLocation);
    document.getElementById('enableNotificationsBtn')?.addEventListener('click', requestNotificationPermission);
```
