import { computed,toRaw,reactive,watch } from 'vue'

export function datetoStr(d){
    const formatted = d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
    });
    
    return formatted;
}

export function daterangeStrtoArray(dateStr) {
    const match = dateStr.replace(/"/g, "").match(/\[[^\)]*\)/g);
    const strdates = []

    if (!match) return strdates;

    match.forEach(d =>{
        const dr = d.replace("[","").replace(")","").split(',')
        if (dr[0].trim() !== '' && dr[1].trim() !== '') {
            const date = new Date(dr[1]);
            date.setDate(date.getDate() - 1)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const finalenddate = `${year}-${month}-${day}`;

            strdates.push([dr[0],finalenddate])
        }else{
            strdates.push([dr[0],""])
        }
    })

    return strdates;
}

export function addremoveDays(date,days){
    date.setDate(date.getDate() + days);
    return date
}

export function generatePagination(currentPage, totalPages) {
    const current = currentPage;
    const last = totalPages;

    // If page count is small, just show all numbers sequential
    if (last <= 6) {
        return Array.from({ length: last }, (_, i) => i + 1);
    }

    // Calculate if we need left and right ellipses
    const showLeftEllipsis = current > 3;
    const showRightEllipsis = current < last - 2;

    // Case 1: Only right ellipsis is needed (Near the beginning)
    if (!showLeftEllipsis && showRightEllipsis) {
        return [1, 2, 3, 4, '...', last];
    }

    // Case 2: Only left ellipsis is needed (Near the end)
    if (showLeftEllipsis && !showRightEllipsis) {
        return [1, '...', last - 3 , last - 2, last - 1, last];
    }

    // Case 3: Both ellipses are needed (Right in the middle)
    return [1, '...', current - 1, current, current + 1, '...', last];
}

export const dirtyFields = (newValues, originalValues) => {
    const dirty = reactive({})

    watch(
        newValues,
        () => {
            for (const key in dirty) {
                delete dirty[key]
            }

            if (!originalValues.value) return

            for (const key in newValues.value) {
                if (
                    JSON.stringify(newValues.value[key]) !==
                    JSON.stringify(originalValues.value[key])
                ) {
                    dirty[key] = newValues.value[key]
                }
            }
        },
        { deep: true, immediate: true }
    )

    return dirty
}