import $ from 'jquery';

$(document).ready(function () {
    const applicantsSearchForm = $('.applicants-filter form');
    applicantsSearchForm.on('change', function () {
        $('.applicants-show-more a').detach();
    });

    const applicantsSearchButton = applicantsSearchForm.find('.applicants-search-button button');
    const applicantsList = $('.applicants-list');

    const applicantsSortButtons = $('.applicants-sort-button');

    const applicantsListLoaderHtml = `
        <div class="applicants-list-loader">
            <div class="sk-grid">
                <div class="sk-grid-cube"></div>
                <div class="sk-grid-cube"></div>
                <div class="sk-grid-cube"></div>
                <div class="sk-grid-cube"></div>
                <div class="sk-grid-cube"></div>
                <div class="sk-grid-cube"></div>
                <div class="sk-grid-cube"></div>
                <div class="sk-grid-cube"></div>
                <div class="sk-grid-cube"></div>
            </div>
        </div>`;
    const applicantsListShowMoreHtml = `
         <div class="applicants-show-more">
            <a href="#">Показать еще...</a>
        </div>`;

    applicantsSearchButton.on('click', applicantsSearchButtonCallback);
    applicantsSortButtons.on('click', applicantsSortButtonsCallback);
    applicantsSearchButton.click();

    function removeSortingOrderTypeClasses() {
        applicantsSortButtons.removeClass('desc');
        applicantsSortButtons.removeClass('asc');
        applicantsSortButtons.data('type', '');
    }

    function switchSortingOrderTypeClass(orderType, button) {
        if (orderType === 'asc') {
            button.removeClass('desc');
            button.addClass('asc');
        } else {
            button.removeClass('asc');
            button.addClass('desc');
        }
    }

    function applicantsSearchButtonCallback(event) {
        event.preventDefault();

        applicantsSortButtons.data('order-type', '');

        const applicantsSearchData = getApplicantsSearchData();

        removeSortingOrderTypeClasses();

        mobileScroll();

        sendMainApplicantsAjaxRequest(applicantsSearchData);
    }

    function applicantsShowMoreCallback(event) {
        event.preventDefault();

        disableSearchAndSortControls();

        const applicantsListShowMoreContainer = $(this).parent();

        let applicantsSearchData = getApplicantsSearchData();
        applicantsSearchData.nextPage = $(this).data('next-page');

        applicantsSearchData.orderColumn = applicantsSortButtons.data('order-column') ?? null;
        applicantsSearchData.orderType = applicantsSortButtons.data('order-type') ?? null;

        $.ajax({
            url: '/api/applicants',
            method: 'GET',
            dataType: 'json',
            data: applicantsSearchData,
            beforeSend: () => {
                applicantsListShowMoreContainer.html(applicantsListLoaderHtml);
            },
        }).then((response) => {
            $('.applicants-list .applicants-show-more').detach();

            applicantsList.append(response.html);

            enableSearchAndSortControls();

            if (response.currentPage !== response.lastPage) {
                addApplicantsListShowMoreCallBack(response);
            }
        }).fail((error) => {
            window.location.reload();
        });
    }

    function getApplicantsSearchData() {
        const applicantsSearchFormData = new FormData(applicantsSearchForm[0]);
        return {
            'search': getFormData('search', applicantsSearchFormData),
            'cityId': getFormData('city_id', applicantsSearchFormData),
            'ageFrom': getFormData('age_from', applicantsSearchFormData),
            'ageTo': getFormData('age_to', applicantsSearchFormData),
            'employments': getFormData('employments', applicantsSearchFormData, true),
            'charts': getFormData('charts', applicantsSearchFormData, true),
            'softs': getFormData('softs', applicantsSearchFormData, true),
            'hards': getFormData('hards', applicantsSearchFormData, true),
            'education': getFormData('education', applicantsSearchFormData, true),
            'salaryFrom': getFormData('salary_from', applicantsSearchFormData),
            'salaryTo': getFormData('salary_to', applicantsSearchFormData),
            'currentAuthUserId': getFormData('current_auth_user_id', applicantsSearchFormData),
        };
    }

    function applicantsSortButtonsCallback() {
        removeSortingOrderTypeClasses();

        let orderType = $(this).data('order-type');
        orderType = orderType === 'desc' ? 'asc' : 'desc';

        $(this).data('order-type', orderType);

        switchSortingOrderTypeClass(orderType, $(this));

        const applicantsSearchData = getApplicantsSearchData();
        applicantsSearchData.order = { 'orderColumn': $(this).data('order-column'), 'orderType': orderType };

        mobileScroll();

        sendMainApplicantsAjaxRequest(applicantsSearchData);
    }

    function addApplicantsListShowMoreCallBack(response) {
        applicantsList.append(applicantsListShowMoreHtml);

        const applicantsListShowMore = $('.applicants-show-more a');
        applicantsListShowMore.data('next-page', response.currentPage + 1);
        applicantsListShowMore.on('click', applicantsShowMoreCallback);
    }

    function sendMainApplicantsAjaxRequest(applicantsSearchData) {
        $.ajax({
            url: '/api/applicants',
            method: 'GET',
            dataType: 'json',
            data: applicantsSearchData,
            beforeSend: () => {
                applicantsList.html('');

                disableSearchAndSortControls();

                applicantsList.append(applicantsListLoaderHtml);
            },
        }).then((response) => {
            enableSearchAndSortControls();

            applicantsList.html(response.html);

            if (response.currentPage !== response.lastPage) {
                addApplicantsListShowMoreCallBack(response);
            }
        }).fail((error) => {
            window.location.reload();
        });
    }

    function disableSearchAndSortControls() {
        applicantsSortButtons.addClass('submit');
        applicantsSortButtons.off('click');

        applicantsSearchButton.addClass('submit');
        applicantsSearchButton.off('click');
        applicantsSearchButton.on('click', function (event) {
            event.preventDefault();
        });
    }

    function enableSearchAndSortControls() {
        applicantsSearchButton.removeClass('submit');
        applicantsSortButtons.removeClass('submit');

        applicantsSearchButton.on('click', applicantsSearchButtonCallback);
        applicantsSortButtons.on('click', applicantsSortButtonsCallback);
    }

    function mobileScroll() {
        if ($(window).width() <= 750) {
            $([document.documentElement, document.body]).animate({
                scrollTop: applicantsList.offset().top,
            }, 2200);
        }
    }

    function getFormData(key, formData, isArray = false) {
        let data = isArray ? formData.getAll(key + '[]') : formData.get(key);

        return (data === null || data.length) ? data : null;
    }
});
