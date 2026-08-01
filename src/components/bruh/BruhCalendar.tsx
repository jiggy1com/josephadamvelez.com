import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { VIEWPORT_HEIGHT_MINUS_NAV } from '@/constants/layout';

export function BruhCalendar() {
    const color = 'B3E2F4';
    const src =
        'ZTNlYjM5MjE4ODBhNDRmNWU5YWJlNDVkNDNiNzVkMjg1ODBhNTQxY2U0NTBhOThkNTEzYTQ2YWE3N2EzMWZlN0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t';
    const calendarUrl = `https://calendar.google.com/calendar/embed?color=%23${color}&src=${src}`;

    return (
        <Flex flexDirection="column" height={VIEWPORT_HEIGHT_MINUS_NAV}>
            {/*<FlexItem>*/}
            {/*    <a className="weatherwidget-io" href="https://forecast7.com/en/40d71n74d01/new-york/"*/}
            {/*       data-label_1="Odessa, FL" data-label_2="Weather" data-theme="original">Odessa, FL Weather</a>*/}
            {/*    <script>*/}
            {/*        !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');*/}
            {/*    </script>*/}
            {/*</FlexItem>*/}
            <FlexItem flexGrow={1} minHeight="0">
                <Flex height="100%">
                    <FlexItem>
                        {/*Elfsight Weather | Untitled Weather */}
                        <script src="https://elfsightcdn.com/platform.js" async></script>
                        <div
                            className="elfsight-app-92052c96-2b03-40c6-a35e-896ca0da256a"
                            data-elfsight-app-lazy></div>
                    </FlexItem>
                    <FlexItem flexGrow={1}>
                        <iframe
                            src={calendarUrl}
                            style={{ border: 0 }}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"></iframe>
                    </FlexItem>
                </Flex>
            </FlexItem>
        </Flex>
    );
}
