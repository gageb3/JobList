// Show message to user
function showMessage(message, type = 'info') {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = `
                <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
    setTimeout(() => {
        messagesDiv.innerHTML = '';
    }, 5000);
}

// Show temporary save indicator
function showSaveIndicator(element, success = true) {
    const indicator = document.createElement('span');
    indicator.className = `save-indicator ms-2 ${success ? 'text-success' : 'text-danger'}`;
    indicator.innerHTML = success ? '<i class="bi bi-check-circle"></i>' : '<i class="bi bi-x-circle"></i>';

    element.appendChild(indicator);
    setTimeout(() => indicator.classList.add('show'), 10);

    setTimeout(() => {
        indicator.classList.remove('show');
        setTimeout(() => element.removeChild(indicator), 300);
    }, 2000);
}

// READ - Load all jobs
async function loadJobs() {
    try {
        const response = await fetch('/api/jobs');
        const jobs = await response.json();

        const jobList = document.getElementById('jobList');

        if (jobs.length === 0) {
            jobList.innerHTML = `
                        <div class="text-center text-muted py-4">
                            <i class="bi bi-earbuds fs-1"></i>
                            <p>No jobs found. Add to the database!</p>
                        </div>
                    `;
            return;
        }

        jobList.innerHTML = jobs.map(job => `
                    <div class="card mb-3 job-card" data-job-id="${job._id}">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-3">
                                    <strong>Company:</strong>
                                    <div class="editable-field" 
                                         data-field="company" 
                                         data-job-id="${job._id}"
                                         title="Click to edit company">${job.company}</div>
                                </div>
                                <div class="col-md-2">
                                    <strong>Position:</strong>
                                    <div class="editable-field" 
                                         data-field="position" 
                                         data-job-id="${job._id}"
                                         title="Click to edit position">${job.position}</div>
                                </div>
                                <div class="col-md-2">
                                    <strong>Date:</strong>
                                    <div class="editable-field" 
                                         data-field="date" 
                                         data-job-id="${job._id}"
                                         title="Click to edit date">${job.date.toISOString().split('T')[0]}</div>
                                </div>
                                <div class="col-md-3">
                                    <small class="text-muted">
                                        <i class="bi bi-tag"></i> ID: ${job._id}
                                    </small>
                                </div>
                                <div class="col-md-2 text-end">
                                    <button class="btn btn-outline-danger btn-sm" 
                                            onclick="deleteJob('${job._id}', '${job.position}')">
                                        <i class="bi bi-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');

        // Add click event listeners for inline editing
        addInlineEditListeners();

        showMessage(`Loaded ${jobs.length} jobs. Click any field to edit!`, 'info');
    } catch (error) {
        showMessage(`❌ Error loading jobs: ${error.message}`, 'danger');
    }
}

// Add inline editing functionality
function addInlineEditListeners() {
    document.querySelectorAll('.editable-field').forEach(field => {
        field.addEventListener('click', function () {
            if (this.querySelector('input')) return; // Already editing

            const currentValue = this.textContent;
            const fieldType = this.getAttribute('data-field');
            const jobId = this.getAttribute('data-job-id');

            // Create input element
            const input = document.createElement('input');
            input.type = fieldType === 'date' ? 'date' : 'text';
            input.value = currentValue;
            input.className = 'form-control form-control-sm';


            // Add styling for editing state
            this.classList.add('editing');
            this.innerHTML = '';
            this.appendChild(input);

            // Focus and select the input
            input.focus();
            input.select();

            // Save on Enter or blur
            const saveEdit = async () => {
                const newValue = input.value.trim();

                if (!newValue) {
                    this.textContent = currentValue;
                    this.classList.remove('editing');
                    showMessage('❌ Value cannot be empty', 'warning');
                    return;
                }

                if (newValue === currentValue) {
                    this.textContent = currentValue;
                    this.classList.remove('editing');
                    return;
                }

                // Update in database
                const success = await updateJobField(jobId, fieldType, newValue);

                if (success) {
                    this.textContent = newValue;
                    showSaveIndicator(this, true);
                } else {
                    this.textContent = currentValue;
                    showSaveIndicator(this, false);
                }

                this.classList.remove('editing');
            };

            input.addEventListener('blur', saveEdit);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveEdit();
                } else if (e.key === 'Escape') {
                    this.textContent = currentValue;
                    this.classList.remove('editing');
                }
            });
        });
    });
}

// UPDATE - Update single field
async function updateJobField(jobId, field, value) {
    try {
        const updateData = {};
        updateData[field] = field === 'date' ? new Date(value) : value;

        const response = await fetch(`/api/jobs/${jobId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`✅ ${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`, 'success');
            return true;
        } else {
            showMessage(`❌ Error: ${result.error}`, 'danger');
            return false;
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
        return false;
    }
}

// DELETE - Delete job
async function deleteJob(id, position) {
    if (!confirm(`Are you sure you want to delete job at position "${position}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/jobs/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`✅ Job at position "${position}" deleted successfully!`, 'success');

            // Animate removal
            const jobCard = document.querySelector(`[data-job-id="${id}"]`);
            if (jobCard) {
                jobCard.style.opacity = '0';
                jobCard.style.transform = 'translateX(-100%)';
                setTimeout(() => {
                    jobCard.remove();
                }, 300);
            }
        } else {
            showMessage(`❌ Error: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
}

// Cleanup Database
async function cleanupDatabase() {
    if (!confirm('⚠️ This will DELETE ALL jobs from the database. Are you sure?')) {
        return;
    }

    try {
        showMessage('🧹 Cleaning database...', 'info');
        const response = await fetch('/api/cleanup', {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`✅ ${result.message}`, 'success');
            loadJobs();
        } else {
            showMessage(`❌ Error: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
}

document.addEventListener('DOMContentLoaded', function() {

// CREATE - Add new job
document.getElementById('addJobForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const job = {
        company: document.getElementById('company').value,
        position: document.getElementById('position').value,
        date: new Date(document.getElementById('date').value)
    };

    try {
        const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(job)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`✅ Job "${job.position}" added successfully!`, 'success');
            document.getElementById('addJobForm').reset();
            loadJobs();
        } else {
            showMessage(`❌ Error: ${result.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`❌ Network error: ${error.message}`, 'danger');
    }
});

// Load jobs when page loads
    loadJobs();
});