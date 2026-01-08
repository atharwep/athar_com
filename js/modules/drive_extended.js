/**
 * 🧩 Drive Extended Service (Module)
 * التعامل مع مكتبة Google Drive مع دعم Pagination وتجاوز الحدود.
 */

class DriveExtendedService {
    constructor() {
        this.bridgeUrl = "https://script.google.com/macros/s/AKfycbwY2K5Jg1KTSDOLGOGVz0b-IDPVVo03oZbKk7rn7Qg6wwkrM2qkqbbum_KFEmY-okgXzA/exec";
    }

    /**
     * جلب الملفات مع دعم الصفحات
     * @param {string} folderId 
     * @param {string} pageToken (Token للصفحة التالية)
     */
    async getFiles(folderId, pageToken = null) {
        let url = `${this.bridgeUrl}?action=lib&folder=${folderId}`;
        if (pageToken) {
            url += `&pageToken=${encodeURIComponent(pageToken)}`;
        }

        try {
            const res = await fetch(url);
            const data = await res.json();

            // Backend adaptation check
            // If backend doesn't support pagination yet, it wraps standard list in same struct
            if (!data.files) {
                // Fallback for old API structure
                return {
                    files: Array.isArray(data) ? data : [],
                    nextPageToken: null
                };
            }

            return {
                files: data.files,
                nextPageToken: data.nextPageToken || null
            };
        } catch (e) {
            console.error("Drive Fetch Error:", e);
            throw e;
        }
    }
}

window.DriveExtendedService = DriveExtendedService;
